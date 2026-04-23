import json
import textwrap

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.config import config
from src.document_pipeline import chunk_text, parse_document, retrieve
from src.ollama_client import OllamaError, ollama
from src.session_store import session_store

router = APIRouter()

SUPPORTED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


# --------------------------------------------------------------------------- #
# Models                                                                        #
# --------------------------------------------------------------------------- #


class SessionResponse(BaseModel):
    session_id: str


class SuggestRequest(BaseModel):
    question_text: str
    question_identifier: str | None = None
    previous_answers: dict[str, str] = {}
    study_metadata: dict[str, str | None] = {}
    current_draft: str | None = None


# --------------------------------------------------------------------------- #
# Routes                                                                        #
# --------------------------------------------------------------------------- #


@router.post("/sessions", response_model=SessionResponse)
async def create_session():
    session = session_store.create()
    return SessionResponse(session_id=session.id)


@router.post("/sessions/{session_id}/documents", status_code=204)
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
):
    session = session_store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    content = await file.read()
    filename = file.filename or "document"

    try:
        text = parse_document(content, filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse document: {exc}") from exc

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=422, detail="Document appears to be empty")

    try:
        embeddings = [await ollama.embed(chunk) for chunk in chunks]
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail=f"Embedding failed: {exc}") from exc

    session.chunks.extend(chunks)
    session.embeddings.extend(embeddings)


@router.post("/sessions/{session_id}/suggest")
async def suggest(session_id: str, body: SuggestRequest):
    session = session_store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    # Retrieve relevant chunks
    context_text = ""
    if session.chunks:
        try:
            query_embedding = await ollama.embed(body.question_text)
        except OllamaError as exc:
            raise HTTPException(status_code=503, detail=f"Embedding failed: {exc}") from exc

        top_chunks = retrieve(
            query_embedding,
            session.embeddings,
            session.chunks,
            top_k=config.retrieval.top_k,
        )
        context_text = "\n\n---\n\n".join(top_chunks)

    prompt = _build_prompt(body, context_text)
    messages = [{"role": "user", "content": prompt}]

    return StreamingResponse(
        _stream_sse(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(session_id: str):
    session_store.delete(session_id)


# --------------------------------------------------------------------------- #
# Helpers                                                                       #
# --------------------------------------------------------------------------- #


def _build_prompt(body: SuggestRequest, context_text: str) -> str:
    prev = "\n".join(f"- {k}: {v}" for k, v in body.previous_answers.items()) or "None"
    meta = "\n".join(f"- {k}: {v}" for k, v in body.study_metadata.items() if v) or "None"
    ctx = context_text or "No reference documents uploaded."
    draft = body.current_draft.strip() if body.current_draft and body.current_draft.strip() else None

    parts = [
        textwrap.dedent(f"""
            You are an expert clinical trial document assistant.

            ## Reference documents
            {ctx}

            ## Study metadata
            {meta}

            ## Previous answers in this document
            {prev}

            ## Current question
            {body.question_text}
        """).strip()
    ]

    if draft:
        parts.append(textwrap.dedent(f"""
            ## User's current draft
            \"\"\"{draft}\"\"\"
        """).strip())

    suggestion_constraint = (
        "Each suggestion must build upon, complete, or refine the user's current draft — "
        "it must be coherent with what the user has already written and must not contradict it."
        if draft else
        "Each suggestion must be relevant to the question and consistent with the study context."
    )

    parts.append(textwrap.dedent(f"""
        Respond ONLY with a valid JSON object — no prose before or after — using this exact schema:
        {{
          "guidance": "<one short paragraph explaining what a good answer should cover>",
          "suggestions": [
            {{
              "rank": 1,
              "text": "<suggested answer text>",
              "rationale": "<one sentence explaining why>",
              "sources": ["<brief excerpt from reference doc that supports this>"]
            }}
          ]
        }}

        Provide 1 to 3 suggestions ranked by relevance. Keep each suggestion concise.
        {suggestion_constraint}
    """).strip())

    return "\n\n".join(parts)


async def _stream_sse(messages: list[dict]):
    try:
        raw = await ollama.chat(messages)
    except OllamaError as exc:
        yield f"event: error\ndata: {json.dumps({'detail': str(exc)})}\n\n"
        return

    # Parse the JSON reply and emit typed SSE events
    try:
        # Strip markdown code fences if the model wrapped the JSON
        clean = raw.strip()
        if clean.startswith("```"):
            lines = clean.splitlines()
            clean = "\n".join(
                l for l in lines if not l.startswith("```")
            ).strip()
        result = json.loads(clean)
    except json.JSONDecodeError:
        # Fallback: emit the raw text as guidance so the user sees something
        yield f"event: guidance\ndata: {json.dumps({'text': raw})}\n\n"
        yield "event: done\ndata: {}\n\n"
        return

    guidance = result.get("guidance", "")
    if guidance:
        yield f"event: guidance\ndata: {json.dumps({'text': guidance})}\n\n"

    for suggestion in result.get("suggestions", []):
        yield f"event: suggestion\ndata: {json.dumps(suggestion)}\n\n"

    yield "event: done\ndata: {}\n\n"
