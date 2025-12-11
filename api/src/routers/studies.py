from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.core.deps import get_db
from src.models.study import Study, StudyCreate, StudyUpdate
from src.services.study import StudyService

router = APIRouter()
service = StudyService()


@router.get("/", response_model=list[Study])
async def list_studies(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await service.list(db)


@router.get("/{study_id}", response_model=Study)
async def get_study(study_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    study = await service.get(db, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.post("/", response_model=Study, status_code=201)
async def create_study(payload: StudyCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await service.create(db, payload)


@router.put("/{study_id}", response_model=Study)
async def update_study(
    study_id: str, payload: StudyUpdate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    study = await service.update(db, study_id, payload)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.delete("/{study_id}", response_model=Study)
async def delete_study(study_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    study = await service.delete(db, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study
