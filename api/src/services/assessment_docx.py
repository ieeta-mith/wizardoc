from dataclasses import dataclass
import os
import re
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.services.assessment import AssessmentService
from src.services.study import StudyService
from src.services.question_pool import QuestionPoolService
from src.services.docx_population import DocxPopulationService


class DocxPopulationError(Exception):
    def __init__(self, message: str, status_code: int = 404):
        super().__init__(message)
        self.status_code = status_code


@dataclass(slots=True)
class PopulatedDocx:
    filename: str
    content_type: str
    data: bytes


def _safe_identifier(value: str) -> str:
    key = re.sub(r"[^A-Za-z0-9_]", "_", value.strip().lower())
    key = re.sub(r"_+", "_", key).strip("_")
    if not key:
        return "question"
    if key[0].isdigit():
        key = f"q_{key}"
    return key


def _apply_unique_key(key: str, registry: set[str]) -> str:
    if key not in registry:
        registry.add(key)
        return key
    suffix = 2
    candidate = f"{key}_{suffix}"
    while candidate in registry:
        suffix += 1
        candidate = f"{key}_{suffix}"
    registry.add(candidate)
    return candidate


class AssessmentDocxService:
    def __init__(
        self,
        assessment_service: AssessmentService | None = None,
        study_service: StudyService | None = None,
        question_pool_service: QuestionPoolService | None = None,
        docx_population_service: DocxPopulationService | None = None,
    ):
        self.assessment_service = assessment_service or AssessmentService()
        self.study_service = study_service or StudyService()
        self.question_pool_service = question_pool_service or QuestionPoolService()
        self.docx_population_service = docx_population_service or DocxPopulationService()

    async def populate(self, db: AsyncIOMotorDatabase, assessment_id: str) -> PopulatedDocx:
        assessment = await self.assessment_service.get(db, assessment_id)
        if not assessment:
            raise DocxPopulationError("Assessment not found", status_code=404)

        study = await self.study_service.get(db, assessment.studyId)
        if not study:
            raise DocxPopulationError("Study not found", status_code=404)

        pool = await self.question_pool_service.get(db, study.poolId)
        if not pool:
            raise DocxPopulationError("Question pool not found", status_code=404)

        docx_file = await self.question_pool_service.download_docx(db, study.poolId)
        if not docx_file:
            raise DocxPopulationError("DOCX template not found for this question pool", status_code=404)

        answers = assessment.answers or {}
        pool_questions = pool.questions or []
        pool_question_ids = {question.id for question in pool_questions}

        answers_by_id: dict[str, str] = {}
        answers_by_identifier: dict[str, str] = {}
        answers_by_key: dict[str, str] = {}
        identifier_keys: dict[str, str] = {}
        used_keys: set[str] = set()
        answer_rows: list[dict] = []

        for question in pool_questions:
            question_payload = question.model_dump()
            answer = answers.get(question.id, "")
            answers_by_id[question.id] = answer
            answers_by_identifier[question.identifier] = answer
            safe_key = _apply_unique_key(_safe_identifier(question.identifier), used_keys)
            answers_by_key[safe_key] = answer
            identifier_keys[question.identifier] = safe_key

            metadata = {
                key: value
                for key, value in question_payload.items()
                if key not in {"id", "identifier", "text"}
            }

            answer_rows.append(
                {
                    "id": question_payload.get("id"),
                    "identifier": question_payload.get("identifier"),
                    "text": question_payload.get("text"),
                    "answer": answer,
                    "answered": bool(answer),
                    "metadata": metadata,
                    **metadata,
                }
            )

        extra_answers = [
            {"id": question_id, "answer": answer}
            for question_id, answer in answers.items()
            if question_id not in pool_question_ids
        ]

        context = {
            "study": study.model_dump(),
            "assessment": assessment.model_dump(),
            "question_pool": pool.model_dump(),
            "answers": answer_rows,
            "answers_by_id": answers_by_id,
            "answers_by_identifier": answers_by_identifier,
            "answers_by_key": answers_by_key,
            "identifier_keys": identifier_keys,
            "extra_answers": extra_answers,
        }
        context.update(answers_by_key)

        populated_bytes = self.docx_population_service.render(docx_file["data"], context)
        base_name, extension = os.path.splitext(docx_file["filename"])
        output_name = f"{base_name}-populated{extension or '.docx'}"

        return PopulatedDocx(
            filename=output_name,
            content_type=docx_file["contentType"],
            data=populated_bytes,
        )
