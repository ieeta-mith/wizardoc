from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict

AnswerProvenance = Literal["user", "ai", "ai-edited"]


class AssessmentBase(BaseModel):
    studyId: str
    name: str
    progress: int
    totalQuestions: int
    answeredQuestions: int
    status: str
    answers: dict[str, str]
    # Maps question ID → how the answer was authored (omitted = "user")
    answerProvenance: dict[str, AnswerProvenance] = {}

    model_config = ConfigDict(populate_by_name=True)


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentUpdate(BaseModel):
    name: str | None = None
    progress: int | None = None
    totalQuestions: int | None = None
    answeredQuestions: int | None = None
    status: str | None = None
    answers: dict[str, str] | None = None
    answerProvenance: dict[str, AnswerProvenance] | None = None


class Assessment(AssessmentBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    lock_owner_id: str | None = None
    lock_owner_name: str | None = None
    lock_expires_at: datetime | None = None


class LockResponse(BaseModel):
    acquired: bool
    lock_owner_id: str | None = None
    lock_owner_name: str | None = None
    lock_expires_at: datetime | None = None
