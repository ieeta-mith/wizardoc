from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.session_store import session_store
from src.routers import sessions


@asynccontextmanager
async def lifespan(app: FastAPI):
    await session_store.start_cleanup_task()
    yield
    await session_store.stop_cleanup_task()


app = FastAPI(
    title="AI Assistance Service",
    summary="RAG-based answer suggestions for the wizard workflow.",
    openapi_url="/ai/openapi.json",
    docs_url="/ai/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/ai", tags=["sessions"])


@app.get("/ai/health", tags=["health"])
async def health():
    return {"status": "ok"}
