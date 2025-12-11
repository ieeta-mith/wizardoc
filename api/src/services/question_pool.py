from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.question_pool import (
    QuestionPool,
    QuestionPoolCreate,
    QuestionPoolUpdate,
)


def _serialize_pool(doc: dict) -> QuestionPool:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    payload["questionCount"] = len(payload.get("questions", []))
    return QuestionPool.model_validate(payload)


class QuestionPoolService:
    collection = "question_pools"

    async def list(self, db: AsyncIOMotorDatabase):
        pools: list[QuestionPool] = []
        cursor = db[self.collection].find({})
        async for doc in cursor:
            pools.append(_serialize_pool(doc))
        return pools

    async def get(self, db: AsyncIOMotorDatabase, pool_id: str):
        doc = await db[self.collection].find_one({"_id": ObjectId(pool_id)})
        return _serialize_pool(doc) if doc else None

    async def create(self, db: AsyncIOMotorDatabase, payload: QuestionPoolCreate):
        data = payload.model_dump()
        data["questionCount"] = len(data.get("questions", []))
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_pool(created)

    async def update(self, db: AsyncIOMotorDatabase, pool_id: str, payload: QuestionPoolUpdate):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        if "questions" in update_data:
            update_data["questionCount"] = len(update_data["questions"])
        if not update_data:
            return await self.get(db, pool_id)
        doc = await db[self.collection].find_one_and_update(
            {"_id": ObjectId(pool_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_pool(doc) if doc else None

    async def delete(self, db: AsyncIOMotorDatabase, pool_id: str):
        doc = await db[self.collection].find_one_and_delete({"_id": ObjectId(pool_id)})
        return _serialize_pool(doc) if doc else None
