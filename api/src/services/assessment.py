from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.assessment import Assessment, AssessmentCreate, AssessmentUpdate, LockResponse
from src.core.deps import AuthenticatedUser

LOCK_TTL_SECONDS = 300 # 5 minutes


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

    async def acquire_lock(self, db: AsyncIOMotorDatabase, assessment_id: str, user: AuthenticatedUser) -> LockResponse | None:
        now = datetime.utcnow()
        display_name = user.email or user.username or user.id
        doc = await db[self.collection].find_one_and_update(
            {
                "_id": ObjectId(assessment_id),
                "$or": [
                    {"lock_owner_id": None},
                    {"lock_owner_id": user.id},
                    {"lock_expires_at": {"$lt": now}},
                ],
            },
            {
                "$set": {
                    "lock_owner_id": user.id,
                    "lock_owner_name": display_name,
                    "lock_expires_at": now + timedelta(seconds=LOCK_TTL_SECONDS),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        if doc:
            return LockResponse(
                acquired=True,
                lock_owner_id=user.id,
                lock_expires_at=doc["lock_expires_at"],
            )
        current = await db[self.collection].find_one({"_id": ObjectId(assessment_id)})
        if not current:
            return None
        return LockResponse(
            acquired=False,
            lock_owner_id=current.get("lock_owner_id"),
            lock_owner_name=current.get("lock_owner_name"),
            lock_expires_at=current.get("lock_expires_at"),
        )

    async def renew_lock(self, db: AsyncIOMotorDatabase, assessment_id: str, user_id: str) -> bool:
        now = datetime.utcnow()
        result = await db[self.collection].update_one(
            {
                "_id": ObjectId(assessment_id),
                "lock_owner_id": user_id,
                "lock_expires_at": {"$gt": now},
            },
            {"$set": {"lock_expires_at": now + timedelta(seconds=LOCK_TTL_SECONDS)}},
        )
        return result.modified_count > 0

    async def release_lock(self, db: AsyncIOMotorDatabase, assessment_id: str, user_id: str) -> bool:
        result = await db[self.collection].update_one(
            {"_id": ObjectId(assessment_id), "lock_owner_id": user_id},
            {"$set": {"lock_owner_id": None, "lock_owner_name": None, "lock_expires_at": None}},
        )
        return result.modified_count > 0
