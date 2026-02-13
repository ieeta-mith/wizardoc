from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


MetadataFieldType = Literal["text", "textarea", "number", "date", "select", "multiselect", "boolean"]


class MetadataFieldDef(BaseModel):
    key: str
    label: str
    type: MetadataFieldType
    required: bool = False
    options: list[str] | None = None
    min: float | None = None
    max: float | None = None
    regex: str | None = None
    default: Any | None = None


class MetadataTemplateBase(BaseModel):
    name: str
    version: int = 1
    fields: list[MetadataFieldDef] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class MetadataTemplateCreate(MetadataTemplateBase):
    pass


class MetadataTemplateUpdate(BaseModel):
    name: str | None = None
    version: int | None = None
    fields: list[MetadataFieldDef] | None = None


class MetadataTemplate(MetadataTemplateBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
