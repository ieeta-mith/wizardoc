from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.study import Study, StudyCreate, StudyUpdate


def _serialize_study(doc: dict) -> Study:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    return Study.model_validate(payload)


class StudyService:
    collection = "studies"

    async def list(self, db: AsyncIOMotorDatabase):
        studies: list[Study] = []
        cursor = db[self.collection].find({})
        async for doc in cursor:
            studies.append(_serialize_study(doc))
        return studies

    async def get(self, db: AsyncIOMotorDatabase, study_id: str):
        doc = await db[self.collection].find_one({"_id": ObjectId(study_id)})
        return _serialize_study(doc) if doc else None

    async def create(self, db: AsyncIOMotorDatabase, payload: StudyCreate):
        now = datetime.utcnow()
        data = payload.model_dump()
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_study(created)

    async def update(self, db: AsyncIOMotorDatabase, study_id: str, payload: StudyUpdate):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        doc = await db[self.collection].find_one_and_update(
            {"_id": ObjectId(study_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_study(doc) if doc else None

    async def delete(self, db: AsyncIOMotorDatabase, study_id: str):
        doc = await db[self.collection].find_one_and_delete({"_id": ObjectId(study_id)})
        return _serialize_study(doc) if doc else None
