from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.core.deps import get_db
from src.models.question_pool import QuestionPool, QuestionPoolCreate, QuestionPoolUpdate
from src.services.question_pool import QuestionPoolService

router = APIRouter()
service = QuestionPoolService()


@router.get("/", response_model=list[QuestionPool])
async def list_question_pools(db: AsyncIOMotorDatabase = Depends(get_db)):
    return await service.list(db)


@router.get("/{pool_id}", response_model=QuestionPool)
async def get_question_pool(pool_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    pool = await service.get(db, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Question pool not found")
    return pool


@router.post("/", response_model=QuestionPool, status_code=201)
async def create_question_pool(
    payload: QuestionPoolCreate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await service.create(db, payload)


@router.put("/{pool_id}", response_model=QuestionPool)
async def update_question_pool(
    pool_id: str, payload: QuestionPoolUpdate, db: AsyncIOMotorDatabase = Depends(get_db)
):
    updated = await service.update(db, pool_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Question pool not found")
    return updated


@router.delete("/{pool_id}", response_model=QuestionPool)
async def delete_question_pool(pool_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    deleted = await service.delete(db, pool_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question pool not found")
    return deleted


@router.post("/{pool_id}/docx", response_model=QuestionPool)
async def upload_question_pool_docx(
    pool_id: str,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are supported")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    updated = await service.upload_docx(db, pool_id, file.filename, file.content_type, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Question pool not found")
    return updated

@router.get("/{pool_id}/docx")
async def download_question_pool_docx(
    pool_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    docx_file = await service.download_docx(db, pool_id)
    if docx_file is None:
        raise HTTPException(status_code=404, detail="Document not found")
    filename = docx_file["filename"].replace("\"", "_")
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(
        content=docx_file["data"],
        media_type=docx_file["contentType"],
        headers=headers,
    )
