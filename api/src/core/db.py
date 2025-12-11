from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI
from src.core.settings import settings

client: AsyncIOMotorClient | None = None


async def get_db(app: FastAPI):
    return app.state.mongo_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    app.state.mongo_client = client
    app.state.mongo_db = client[settings.MONGODB_DB_NAME]
    try:
        yield
    finally:
        if client:
            client.close()
