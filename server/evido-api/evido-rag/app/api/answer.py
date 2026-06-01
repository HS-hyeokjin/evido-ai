from fastapi import APIRouter, HTTPException

from app.schemas.answer import AnswerRequest, AnswerResponse
from app.services.answer_orchestrator import AnswerOrchestrator

router = APIRouter()
_orchestrator = AnswerOrchestrator()


@router.post("", response_model=AnswerResponse)
def answer(req: AnswerRequest):
    if not req.queryText.strip():
        raise HTTPException(400, "질문 내용이 없습니다.")

    return _orchestrator.answer(req)