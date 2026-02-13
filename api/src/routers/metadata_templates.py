from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from src.core.deps import get_db
from src.models.metadata_template import (
    MetadataTemplate,
    MetadataTemplateCreate,
    MetadataTemplateUpdate,
)
from src.services.metadata_template import MetadataTemplateService

router = APIRouter()
service = MetadataTemplateService()


@router.get("/", response_model=list[MetadataTemplate])
async def list_metadata_templates(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await service.list(db)


@router.get("/{template_id}", response_model=MetadataTemplate)
async def get_metadata_template(template_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        template = await service.get(db, template_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not template:
        raise HTTPException(status_code=404, detail="Metadata template not found")
    return template


@router.post("/", response_model=MetadataTemplate, status_code=201)
async def create_metadata_template(
    payload: MetadataTemplateCreate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await service.create(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/{template_id}", response_model=MetadataTemplate)
async def update_metadata_template(
    template_id: str, payload: MetadataTemplateUpdate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        template = await service.update(db, template_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not template:
        raise HTTPException(status_code=404, detail="Metadata template not found")
    return template


@router.delete("/{template_id}", response_model=MetadataTemplate)
async def delete_metadata_template(template_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        template = await service.delete(db, template_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not template:
        raise HTTPException(status_code=404, detail="Metadata template not found")
    return template
