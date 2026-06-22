import json
from typing import Any, Iterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.answer import AnswerRequest, AnswerResponse
from app.services.answer_orchestrator import AnswerOrchestrator

router = APIRouter()

_orchestrator = AnswerOrchestrator()


@router.post("", response_model=AnswerResponse)
def answer(req: AnswerRequest):
    if not req.queryText.strip():
        raise HTTPException(status_code=400, detail="질문 내용이 없습니다.")

    return _orchestrator.answer(req)


@router.post("/stream")
def answer_stream(req: AnswerRequest):
    if not req.queryText.strip():
        raise HTTPException(status_code=400, detail="질문 내용이 없습니다.")

    def event_generator() -> Iterator[str]:
        for event in _orchestrator.stream_answer(req):
            yield sse_event(event)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def sse_event(data: dict[str, Any]) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"