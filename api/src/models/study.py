from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from src.models.metadata_template import MetadataFieldDef


class StudyBase(BaseModel):
    name: str | None = None
    phase: str | None = None
    therapeuticArea: str | None = None
    studyQuestion: str | None = None
    poolId: str
    metadataTemplateId: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(populate_by_name=True)


class StudyCreate(StudyBase):
    pass


class StudyUpdate(BaseModel):
    name: str | None = None
    phase: str | None = None
    therapeuticArea: str | None = None
    studyQuestion: str | None = None
    poolId: str | None = None
    metadataTemplateId: str | None = None
    metadata: dict[str, Any] | None = None


class Study(StudyBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    metadataTemplateSnapshot: list[MetadataFieldDef] | None = None
