from fastapi import APIRouter, Depends, HTTPException, Query, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.core.deps import get_db
from src.models.assessment import Assessment, AssessmentCreate, AssessmentUpdate
from src.services.assessment import AssessmentService
from src.services.assessment_docx import AssessmentDocxService, DocxPopulationError

router = APIRouter()
service = AssessmentService()
docx_service = AssessmentDocxService()


@router.get("/", response_model=list[Assessment])
async def list_assessments(
    studyId: str | None = Query(default=None, alias="studyId"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await service.list(db, study_id=studyId)


@router.get("/{assessment_id}", response_model=Assessment)
async def get_assessment(assessment_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    assessment = await service.get(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/", response_model=Assessment, status_code=201)
async def create_assessment(
    payload: AssessmentCreate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await service.create(db, payload)


@router.put("/{assessment_id}", response_model=Assessment)
async def update_assessment(
    assessment_id: str,
    payload: AssessmentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    updated = await service.update(db, assessment_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return updated


@router.delete("/{assessment_id}", response_model=Assessment)
async def delete_assessment(assessment_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    deleted = await service.delete(db, assessment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return deleted


@router.post("/{assessment_id}/docx")
async def populate_assessment_docx(
    assessment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
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
