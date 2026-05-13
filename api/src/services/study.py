from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.study import Study, StudyCollaborator, StudyCreate, StudyUpdate


def _serialize_study(doc: dict) -> Study:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    return Study.model_validate(payload)


def _access_filter(user_id: str) -> dict:
    return {"$or": [{"owner_id": user_id}, {"shared_with.id": user_id}]}


class StudyService:
    collection = "studies"

    async def list(self, db: AsyncIOMotorDatabase, user_id: str | None = None):
        studies: list[Study] = []
        query: dict = _access_filter(user_id) if user_id else {}
        cursor = db[self.collection].find(query)
        async for doc in cursor:
            studies.append(_serialize_study(doc))
        return studies

    async def get(
        self,
        db: AsyncIOMotorDatabase,
        study_id: str,
        user_id: str | None = None,
    ):
        query: dict = {"_id": ObjectId(study_id)}
        if user_id:
            query.update(_access_filter(user_id))
        doc = await db[self.collection].find_one(query)
        return _serialize_study(doc) if doc else None

    async def create(
        self,
        db: AsyncIOMotorDatabase,
        payload: StudyCreate,
        owner_id: str,
    ):
        now = datetime.utcnow()
        data = payload.model_dump()
        data["owner_id"] = owner_id
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_study(created)

    async def update(
        self,
        db: AsyncIOMotorDatabase,
        study_id: str,
        payload: StudyUpdate,
        user_id: str | None = None,
    ):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        query: dict = {"_id": ObjectId(study_id)}
        if user_id:
            query.update(_access_filter(user_id))
        doc = await db[self.collection].find_one_and_update(
            query,
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_study(doc) if doc else None

    async def delete(
        self,
        db: AsyncIOMotorDatabase,
        study_id: str,
        owner_id: str | None = None,
    ):
        query: dict = {"_id": ObjectId(study_id)}
        if owner_id:
            query["owner_id"] = owner_id
        doc = await db[self.collection].find_one_and_delete(query)
        return _serialize_study(doc) if doc else None

    async def add_collaborator(
        self,
        db: AsyncIOMotorDatabase,
        study_id: str,
        collaborator: StudyCollaborator,
        owner_id: str,
    ) -> Study | None:
        doc = await db[self.collection].find_one_and_update(
            {"_id": ObjectId(study_id), "owner_id": owner_id, "shared_with.id": {"$ne": collaborator.id}},
            {
                "$push": {"shared_with": collaborator.model_dump()},
                "$set": {"updatedAt": datetime.utcnow()},
            },
            return_document=ReturnDocument.AFTER,
        )
        if doc is None:
            existing = await db[self.collection].find_one(
                {"_id": ObjectId(study_id), "owner_id": owner_id}
            )
            return _serialize_study(existing) if existing else None
        return _serialize_study(doc)

    async def remove_collaborator(
        self,
        db: AsyncIOMotorDatabase,
        study_id: str,
        target_user_id: str,
        requesting_user_id: str,
    ) -> Study | None:
        """Owner can remove anyone; a sharee can only remove themselves (leave)."""
        if requesting_user_id == target_user_id:
            query: dict = {"_id": ObjectId(study_id), "shared_with.id": requesting_user_id}
        else:
            query = {"_id": ObjectId(study_id), "owner_id": requesting_user_id}
        doc = await db[self.collection].find_one_and_update(
            query,
            {
                "$pull": {"shared_with": {"id": target_user_id}},
                "$set": {"updatedAt": datetime.utcnow()},
            },
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_study(doc) if doc else None
