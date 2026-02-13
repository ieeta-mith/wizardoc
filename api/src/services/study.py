from datetime import datetime
import re
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from src.models.study import Study, StudyCreate, StudyUpdate
from src.models.metadata_template import MetadataFieldDef, MetadataTemplate
from src.services.metadata_template import MetadataTemplateService


def _serialize_study(doc: dict) -> Study:
    payload = {**doc}
    payload["id"] = str(payload.pop("_id"))
    return Study.model_validate(payload)


class StudyService:
    collection = "studies"

    def __init__(self, metadata_service: MetadataTemplateService | None = None):
        self.metadata_service = metadata_service or MetadataTemplateService()

    def _validate_field_value(self, field: MetadataFieldDef, value):
        if value is None:
            return

        if field.type in ("text", "textarea"):
            if not isinstance(value, str):
                raise ValueError(f"Field '{field.key}' must be a string")
            if field.min is not None and len(value) < field.min:
                raise ValueError(f"Field '{field.key}' must be at least {field.min} characters")
            if field.max is not None and len(value) > field.max:
                raise ValueError(f"Field '{field.key}' must be at most {field.max} characters")
            if field.regex and not re.fullmatch(field.regex, value):
                raise ValueError(f"Field '{field.key}' does not match required format")
            return

        if field.type == "number":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError(f"Field '{field.key}' must be a number")
            if field.min is not None and value < field.min:
                raise ValueError(f"Field '{field.key}' must be >= {field.min}")
            if field.max is not None and value > field.max:
                raise ValueError(f"Field '{field.key}' must be <= {field.max}")
            return

        if field.type == "date":
            if not isinstance(value, str):
                raise ValueError(f"Field '{field.key}' must be an ISO date string")
            try:
                datetime.fromisoformat(value)
            except ValueError as exc:
                raise ValueError(f"Field '{field.key}' must be an ISO date string") from exc
            return

        if field.type == "select":
            if not isinstance(value, str):
                raise ValueError(f"Field '{field.key}' must be a string")
            if not field.options or value not in field.options:
                raise ValueError(f"Field '{field.key}' must be one of the allowed options")
            return

        if field.type == "multiselect":
            if not isinstance(value, list) or any(not isinstance(v, str) for v in value):
                raise ValueError(f"Field '{field.key}' must be a list of strings")
            if not field.options:
                raise ValueError(f"Field '{field.key}' must define allowed options")
            invalid = [v for v in value if v not in field.options]
            if invalid:
                raise ValueError(f"Field '{field.key}' contains invalid options")
            return

        if field.type == "boolean":
            if not isinstance(value, bool):
                raise ValueError(f"Field '{field.key}' must be true or false")
            return

        raise ValueError(f"Unsupported field type for '{field.key}'")

    def _validate_metadata(self, metadata: dict, template: MetadataTemplate):
        field_map = {field.key: field for field in template.fields}
        unknown = set(metadata.keys()) - set(field_map.keys())
        if unknown:
            joined = ", ".join(sorted(unknown))
            raise ValueError(f"Unknown metadata field(s): {joined}")

        for field in template.fields:
            if not field.required:
                continue
            if field.key not in metadata:
                raise ValueError(f"Missing required field: {field.key}")
            value = metadata[field.key]
            if value is None or value == "" or value == []:
                raise ValueError(f"Missing required field: {field.key}")

        for key, value in metadata.items():
            self._validate_field_value(field_map[key], value)

    async def _get_template(self, db: AsyncIOMotorDatabase, template_id: str) -> MetadataTemplate:
        try:
            ObjectId(template_id)
        except InvalidId as exc:
            raise ValueError("Invalid metadataTemplateId") from exc
        template = await self.metadata_service.get(db, template_id)
        if not template:
            raise ValueError("Metadata template not found")
        return template

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
        if payload.metadata and not payload.metadataTemplateId:
            raise ValueError("metadata provided without metadataTemplateId")

        template_snapshot = None
        if payload.metadataTemplateId:
            template = await self._get_template(db, payload.metadataTemplateId)
            self._validate_metadata(payload.metadata or {}, template)
            template_snapshot = [field.model_dump() for field in template.fields]

        now = datetime.utcnow()
        data = payload.model_dump()
        if template_snapshot is not None:
            data["metadataTemplateSnapshot"] = template_snapshot
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await db[self.collection].insert_one(data)
        created = await db[self.collection].find_one({"_id": result.inserted_id})
        return _serialize_study(created)

    async def update(self, db: AsyncIOMotorDatabase, study_id: str, payload: StudyUpdate):
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        needs_validation = "metadata" in update_data or "metadataTemplateId" in update_data
        if needs_validation:
            existing = await db[self.collection].find_one({"_id": ObjectId(study_id)})
            if not existing:
                return None
            template_id = update_data.get("metadataTemplateId", existing.get("metadataTemplateId"))
            if not template_id:
                if update_data.get("metadata"):
                    raise ValueError("metadata provided without metadataTemplateId")
                if "metadataTemplateId" in update_data:
                    update_data["metadata"] = {}
                    update_data["metadataTemplateSnapshot"] = None
            else:
                template = await self._get_template(db, template_id)
                metadata = update_data.get("metadata", existing.get("metadata", {}))
                self._validate_metadata(metadata, template)
                update_data["metadataTemplateSnapshot"] = [field.model_dump() for field in template.fields]
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
