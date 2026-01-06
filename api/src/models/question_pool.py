from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List


class Question(BaseModel):
    id: str
    identifier: str
    text: str
    domain: str
    riskType: str
    isoReference: str


class QuestionPoolBase(BaseModel):
    name: str
    source: str
    questions: List[Question] = Field(default_factory=list)
    questionCount: int = 0

    model_config = ConfigDict(populate_by_name=True)


class QuestionPoolCreate(QuestionPoolBase):
    pass


class QuestionPoolUpdate(BaseModel):
    name: str | None = None
    source: str | None = None
    questions: List[Question] | None = None


class DocxFile(BaseModel):
    filename: str
    contentType: str
    size: int
    uploadedAt: datetime


class QuestionPool(QuestionPoolBase):
    id: str = Field(alias="id")
    docxFile: DocxFile | None = None

    model_config = ConfigDict(populate_by_name=True)
