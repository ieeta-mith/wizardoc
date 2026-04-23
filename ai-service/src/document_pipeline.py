import io
from pathlib import Path

import numpy as np


def parse_document(content: bytes, filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return _parse_pdf(content)
    if suffix in (".docx", ".doc"):
        return _parse_docx(content)
    # plain text fallback
    return content.decode("utf-8", errors="replace")


def _parse_pdf(content: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _parse_docx(content: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def chunk_text(text: str, max_words: int = 400, overlap: int = 50) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return chunks


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def retrieve(
    query_embedding: list[float],
    chunk_embeddings: list[list[float]],
    chunks: list[str],
    top_k: int,
) -> list[str]:
    if not chunks:
        return []
    scores = [cosine_similarity(query_embedding, e) for e in chunk_embeddings]
    ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    return [chunks[i] for i in ranked[:top_k]]
