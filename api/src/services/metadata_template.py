from datetime import datetime
import re

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from src.models.metadata_template import (
    MetadataFieldDef,
    MetadataTemplate,
    MetadataTemplateCreate,
    MetadataTemplateUpdate,
)


def _serialize_template(doc: dict) -> MetadataTemplate:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    return MetadataTemplate.model_validate(payload)


class MetadataTemplateService:
    collection = "metadata_templates"

    def _object_id(self, template_id: str) -> ObjectId:
        try:
            return ObjectId(template_id)
        except InvalidId as exc:
            raise ValueError("Invalid template id") from exc

    def _validate_fields(self, fields: list[MetadataFieldDef]):
        keys: set[str] = set()
        for field in fields:
            if field.key in keys:
                raise ValueError(f"Duplicate field key: {field.key}")
            keys.add(field.key)

            if field.type in ("select", "multiselect"):
                if not field.options:
                    raise ValueError(f"Options required for field: {field.key}")
                if len(set(field.options)) != len(field.options):
                    raise ValueError(f"Duplicate options for field: {field.key}")

            if field.min is not None and field.max is not None and field.min > field.max:
                raise ValueError(f"Invalid min/max for field: {field.key}")

            if field.regex:
                try:
                    re.compile(field.regex)
                except re.error as exc:
                    raise ValueError(f"Invalid regex for field: {field.key}") from exc

    async def list(self, db: AsyncIOMotorDatabase):
        templates: list[MetadataTemplate] = []
        cursor = db[self.collection].find({})
        async for doc in cursor:
            templates.append(_serialize_template(doc))
        return templates

    async def get(self, db: AsyncIOMotorDatabase, template_id: str):
        doc = await db[self.collection].find_one({"_id": self._object_id(template_id)})
        return _serialize_template(doc) if doc else None

    async def create(self, db: AsyncIOMotorDatabase, payload: MetadataTemplateCreate):
        self._validate_fields(payload.fields)
        now = datetime.utcnow()
        data = payload.model_dump()
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_template(created)

    async def update(self, db: AsyncIOMotorDatabase, template_id: str, payload: MetadataTemplateUpdate):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        if "fields" in update_data:
            self._validate_fields(update_data["fields"])
        update_data["updatedAt"] = datetime.utcnow()
        doc = await db[self.collection].find_one_and_update(
            {"_id": self._object_id(template_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize_template(doc) if doc else None

    async def delete(self, db: AsyncIOMotorDatabase, template_id: str):
        doc = await db[self.collection].find_one_and_delete({"_id": self._object_id(template_id)})
        return _serialize_template(doc) if doc else None
