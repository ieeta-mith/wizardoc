from fastapi import APIRouter, Depends, HTTPException, Query, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.core.deps import get_db, get_authenticated_user, AuthenticatedUser
from src.models.assessment import Assessment, AssessmentCreate, AssessmentUpdate
from src.services.assessment import AssessmentService
from src.services.assessment_docx import AssessmentDocxService, DocxPopulationError
from src.services.study import StudyService

router = APIRouter()
service = AssessmentService()
docx_service = AssessmentDocxService()
_study_service = StudyService()


async def _require_study_access(
    db: AsyncIOMotorDatabase,
    study_id: str,
    user: AuthenticatedUser,
) -> None:
    study = await _study_service.get(db, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    collaborator_ids = {c.id for c in (study.shared_with or [])}
    if study.owner_id != user.id and user.id not in collaborator_ids:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/", response_model=list[Assessment])
async def list_assessments(
    studyId: str | None = Query(default=None, alias="studyId"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    if studyId:
        await _require_study_access(db, studyId, user)
    return await service.list(db, study_id=studyId)


@router.get("/{assessment_id}", response_model=Assessment)
async def get_assessment(
    assessment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    assessment = await service.get(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    await _require_study_access(db, assessment.studyId, user)
    return assessment


@router.post("/", response_model=Assessment, status_code=201)
async def create_assessment(
    payload: AssessmentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    await _require_study_access(db, payload.studyId, user)
    return await service.create(db, payload)


@router.put("/{assessment_id}", response_model=Assessment)
async def update_assessment(
    assessment_id: str,
    payload: AssessmentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    assessment = await service.get(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    await _require_study_access(db, assessment.studyId, user)
    updated = await service.update(db, assessment_id, payload)
    return updated


@router.delete("/{assessment_id}", response_model=Assessment)
async def delete_assessment(
    assessment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    assessment = await service.get(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    await _require_study_access(db, assessment.studyId, user)
    deleted = await service.delete(db, assessment_id)
    return deleted


@router.post("/{assessment_id}/docx")
async def populate_assessment_docx(
    assessment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: AuthenticatedUser = Depends(get_authenticated_user),
):
    assessment = await service.get(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    await _require_study_access(db, assessment.studyId, user)
    try:
        populated = await docx_service.populate(db, assessment_id)
    except DocxPopulationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    filename = populated.filename.replace("\"", "_")
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(
        content=populated.data,
        media_type=populated.content_type,
        headers=headers,
    )
