from fastapi import APIRouter, HTTPException

from app.schemas.answer import AnswerRequest, AnswerResponse, Evidence
from app.schemas.router import RouteAction
from app.services.vector_index import VectorIndex
from app.db.session import get_engine
from app.repositories.document_chunk_repo import get_chunks_by_ids

from app.services.llm_groq import GroqLLM
from app.services.question_router import QuestionRouter

router = APIRouter()
_index = VectorIndex()
_llm = GroqLLM()
_question_router = QuestionRouter()


@router.post("", response_model=AnswerResponse)
def answer(req: AnswerRequest):
    if not req.queryText.strip():
        raise HTTPException(400, "질문 내용이 없습니다.")

    route = _question_router.route(req.queryText)

    print(
        "[ROUTER]",
        {
            "action": route.action,
            "reason": route.reason,
            "top_k": route.top_k,
            "prompt_type": route.prompt_type,
            "confidence": route.confidence,
        },
    )

    if route.action == RouteAction.BASIC_RESPONSE:
        return AnswerResponse(
            queryText=req.queryText,
            answer=route.response or "안녕하세요. 업로드한 문서에 대해 궁금한 내용을 질문해 주세요.",
            evidences=[],
        )

    if route.action == RouteAction.CLARIFY:
        return AnswerResponse(
            queryText=req.queryText,
            answer=route.response or "질문을 조금 더 구체적으로 입력해 주세요.",
            evidences=[],
        )

    if route.action == RouteAction.OUT_OF_SCOPE:
        return AnswerResponse(
            queryText=req.queryText,
            answer=route.response or "이 질문은 업로드된 문서를 기준으로 답변하기 어렵습니다.",
            evidences=[],
        )

    top_k = req.topK or route.top_k or 5

    results = _index.search(
        workspace_id=req.workspaceId,
        query_text=req.queryText,
        limit=top_k,
    )

    if not results:
        return AnswerResponse(
            queryText=req.queryText,
            answer="문서에서 근거를 찾지 못했습니다.",
            evidences=[],
        )

    chunk_ids = []
    for p in results:
        try:
            chunk_ids.append(int(p.id))
        except Exception:
            continue

    if not chunk_ids:
        return AnswerResponse(
            queryText=req.queryText,
            answer="문서에서 근거를 찾지 못했습니다. (검색 결과의 chunk_id 파싱 실패)",
            evidences=[],
        )

    engine = get_engine()
    rows = get_chunks_by_ids(engine, chunk_ids)

    by_id = {}
    for r in rows:
        try:
            by_id[int(r["chunk_id"])] = r
        except Exception:
            continue

    contexts = []
    evidences = []

    for p in results:
        try:
            cid = int(p.id)
        except Exception:
            continue

        row = by_id.get(cid)
        if not row:
            continue

        content = row.get("content") or ""

        contexts.append({
            "chunkId": cid,
            "score": float(p.score),
            "chunkIndex": int(row["chunk_index"]),
            "content": content,
        })

        evidences.append(Evidence(
            chunkId=cid,
            score=float(p.score),
            chunkIndex=int(row["chunk_index"]),
            contentHead=content[:200] + ("..." if len(content) > 200 else ""),
        ))

    if not contexts:
        return AnswerResponse(
            queryText=req.queryText,
            answer="문서에서 근거를 찾지 못했습니다. (DB에서 청크를 못 가져오거나 chunk_id 매칭 실패)",
            evidences=evidences,
        )

    try:
        final_answer = _llm.generate_answer(req.queryText, contexts)
    except Exception as e:
        print("[LLM ERROR]", repr(e))
        final_answer = (
            f"현재 LLM 호출이 불가하여 답변을 생성하지 못했습니다. "
            f"(원인: {type(e).__name__}: {e})\n"
            f"아래 근거를 확인해 주세요."
        )

    return AnswerResponse(
        queryText=req.queryText,
        answer=final_answer,
        evidences=evidences,
    )