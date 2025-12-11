from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.assessment import Assessment, AssessmentCreate, AssessmentUpdate


def _serialize_assessment(doc: dict) -> Assessment:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    return Assessment.model_validate(payload)


class AssessmentService:
    collection = "assessments"

    async def list(self, db: AsyncIOMotorDatabase, study_id: str | None = None):
        query = {"studyId": study_id} if study_id else {}
        items: list[Assessment] = []
        cursor = db[self.collection].find(query)
        async for doc in cursor:
            items.append(_serialize_assessment(doc))
        return items

    async def get(self, db: AsyncIOMotorDatabase, assessment_id: str):
        doc = await db[self.collection].find_one({"_id": ObjectId(assessment_id)})
        return _serialize_assessment(doc) if doc else None

    async def create(self, db: AsyncIOMotorDatabase, payload: AssessmentCreate):
        now = datetime.utcnow()
        data = payload.model_dump()
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_assessment(created)

    async def update(self, db: AsyncIOMotorDatabase, assessment_id: str, payload: AssessmentUpdate):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        doc = await db[self.collection].find_one_and_update(
            {"_id": ObjectId(assessment_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_assessment(doc) if doc else None

    async def delete(self, db: AsyncIOMotorDatabase, assessment_id: str):
        doc = await db[self.collection].find_one_and_delete({"_id": ObjectId(assessment_id)})
        return _serialize_assessment(doc) if doc else None
