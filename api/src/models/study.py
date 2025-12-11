from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StudyBase(BaseModel):
    name: str
    phase: str
    therapeuticArea: str
    studyQuestion: str
    poolId: str

    model_config = ConfigDict(populate_by_name=True)


class StudyCreate(StudyBase):
    pass


class StudyUpdate(BaseModel):
    name: str | None = None
    phase: str | None = None
    therapeuticArea: str | None = None
    studyQuestion: str | None = None
    poolId: str | None = None


class Study(StudyBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
