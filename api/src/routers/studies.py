from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from src.core.deps import AuthenticatedUser, get_authenticated_user, get_db
from src.models.study import Study, StudyCollaborator, StudyCreate, StudyUpdate
from src.services.study import StudyService

router = APIRouter()
service = StudyService()


class SharePayload(BaseModel):
    userId: str
    email: str | None = None
    name: str | None = None


@router.get("/", response_model=list[Study])
async def list_studies(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    return await service.list(db, user_id=user.id)


@router.get("/{study_id}", response_model=Study)
async def get_study(
    study_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    study = await service.get(db, study_id, user_id=user.id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.post("/", response_model=Study, status_code=201)
async def create_study(
    payload: StudyCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    try:
        return await service.create(db, payload, owner_id=user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/{study_id}", response_model=Study)
async def update_study(
    study_id: str,
    payload: StudyUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    try:
        study = await service.update(db, study_id, payload, user_id=user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.delete("/{study_id}", response_model=Study)
async def delete_study(
    study_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    study = await service.delete(db, study_id, owner_id=user.id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.post("/{study_id}/share", response_model=Study)
async def share_study(
    study_id: str,
    payload: SharePayload,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    if payload.userId == user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")
    collaborator = StudyCollaborator(id=payload.userId, email=payload.email, name=payload.name)
    study = await service.add_collaborator(db, study_id, collaborator, owner_id=user.id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found or access denied")
    return study


@router.delete("/{study_id}/share/{target_user_id}", response_model=Study)
async def unshare_study(
    study_id: str,
    target_user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    study = await service.remove_collaborator(
        db, study_id, target_user_id, requesting_user_id=user.id
    )
    if not study:
        raise HTTPException(status_code=404, detail="Study not found or access denied")
    return study
