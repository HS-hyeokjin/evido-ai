from fastapi import APIRouter, HTTPException

from app.schemas.conversation_summary import (
    ConversationSummaryRequest,
    ConversationSummaryResponse,
)
from app.services.conversation_summarizer import ConversationSummarizer


router = APIRouter()
_summarizer = ConversationSummarizer()


@router.post("/conversation/summary", response_model=ConversationSummaryResponse)
def summarize_conversation(req: ConversationSummaryRequest):
    if not req.messages:
        return ConversationSummaryResponse(
            summary=req.oldSummary or ""
        )

    try:
        summary = _summarizer.summarize(
            old_summary=req.oldSummary,
            messages=req.messages,
        )

        return ConversationSummaryResponse(summary=summary)

    except Exception as e:
        print("[CONVERSATION SUMMARY ERROR]", repr(e))
        raise HTTPException(
            status_code=500,
            detail=f"대화 요약 생성 실패: {type(e).__name__}: {e}"
        )