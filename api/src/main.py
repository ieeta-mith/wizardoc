from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from src.core.db import lifespan
from src.routers import assessments, auth, question_pools, studies


app = FastAPI(
    title="Project Template API",
    summary="API to serve Project Template.",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
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


@app.get("/health", tags=["Health"])
async def health_check(request: Request):
    try:
        await request.app.state.mongo_db.command("ping")
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=503, detail="MongoDB unavailable") from exc
    return {"status": "ok"}

# Include routers
# app.include_router(product.router, prefix="/api/products", tags=["products"])
app.include_router(question_pools.router, prefix="/api/question-pools", tags=["question-pools"])
app.include_router(studies.router, prefix="/api/studies", tags=["studies"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["assessments"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
