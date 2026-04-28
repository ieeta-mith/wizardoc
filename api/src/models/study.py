from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class StudyCollaborator(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None


class StudyBase(BaseModel):
    name: str | None = None
    category: str | None = None
    studyQuestion: str | None = None
    poolId: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    shared_with: list[StudyCollaborator] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class StudyCreate(StudyBase):
    pass


class StudyUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    studyQuestion: str | None = None
    poolId: str | None = None
    metadata: dict[str, Any] | None = None


class Study(StudyBase):
    id: str
    owner_id: str | None = None
    createdAt: datetime
    updatedAt: datetime
