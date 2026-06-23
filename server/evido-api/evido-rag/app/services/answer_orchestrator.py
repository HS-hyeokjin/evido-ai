from typing import Iterator, Any

from app.schemas.answer import AnswerRequest, AnswerResponse, Evidence
from app.schemas.router import RouteAction
from app.services.query_rewriter import QueryRewriter
from app.services.vector_index import VectorIndex
from app.db.session import get_engine
from app.repositories.document_chunk_repo import get_chunks_by_ids
from app.services.llm_groq import GroqLLM
from app.services.question_router import QuestionRouter


class AnswerOrchestrator:
    def __init__(self):
        self.index = VectorIndex()
        self.llm = GroqLLM()
        self.question_router = QuestionRouter()
        self.query_rewriter = QueryRewriter()

    def answer(self, req: AnswerRequest) -> AnswerResponse:
        route = self.question_router.route(
            query=req.queryText,
            conversation_summary=req.conversationSummary,
            recent_messages=req.recentMessages,
        )

        self._log_route(route)

        if route.action == RouteAction.BASIC_RESPONSE:
            return AnswerResponse(
                queryText=req.queryText,
                answer=route.response or "안녕하세요. 업로드한 문서에 대해 궁금한 내용을 질문해 주세요.",
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        if route.action == RouteAction.CONTEXT_RESPONSE:
            return AnswerResponse(
                queryText=req.queryText,
                answer=route.response or self._build_context_response(req),
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        if route.action == RouteAction.CLARIFY:
            return AnswerResponse(
                queryText=req.queryText,
                answer=route.response or "질문을 조금 더 구체적으로 입력해 주세요.",
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        if route.action == RouteAction.OUT_OF_SCOPE:
            return AnswerResponse(
                queryText=req.queryText,
                answer=route.response or "이 질문은 업로드된 문서를 기준으로 답변하기 어렵습니다.",
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        return self._rag_answer(req, route)

    def stream_answer(self, req: AnswerRequest) -> Iterator[dict[str, Any]]:
        try:
            yield {
                "type": "status",
                "message": "질문을 분석하고 있습니다.",
            }

            route = self.question_router.route(
                query=req.queryText,
                conversation_summary=req.conversationSummary,
                recent_messages=req.recentMessages,
            )

            self._log_route(route)

            if route.action == RouteAction.BASIC_RESPONSE:
                yield {
                    "type": "token",
                    "content": route.response or "안녕하세요. 업로드한 문서에 대해 궁금한 내용을 질문해 주세요.",
                }
                yield {"type": "done"}
                return

            if route.action == RouteAction.CONTEXT_RESPONSE:
                yield {
                    "type": "token",
                    "content": route.response or self._build_context_response(req),
                }
                yield {"type": "done"}
                return

            if route.action == RouteAction.CLARIFY:
                yield {
                    "type": "token",
                    "content": route.response or "질문을 조금 더 구체적으로 입력해 주세요.",
                }
                yield {"type": "done"}
                return

            if route.action == RouteAction.OUT_OF_SCOPE:
                yield {
                    "type": "token",
                    "content": route.response or "이 질문은 업로드된 문서를 기준으로 답변하기 어렵습니다.",
                }
                yield {"type": "done"}
                return

            yield from self._rag_stream_answer(req, route)

        except Exception as e:
            print("[STREAM ANSWER ERROR]", repr(e))
            yield {
                "type": "error",
                "code": "RAG_STREAM_ERROR",
                "message": f"답변 생성 중 오류가 발생했습니다. ({type(e).__name__}: {e})",
            }

    def _rag_answer(self, req: AnswerRequest, route) -> AnswerResponse:
        """
        기존 RAG 동기 답변 생성 함수.
        기존 /answer API에서 사용한다.
        """
        top_k = req.topK or route.top_k or 5

        rewritten_query = self.query_rewriter.rewrite(
            query=req.queryText,
            conversation_summary=req.conversationSummary,
            recent_messages=req.recentMessages,
        )

        self._log_query_rewrite(req, rewritten_query)

        results = self.index.search(
            workspace_id=req.workspaceId,
            query_text=rewritten_query,
            limit=top_k,
        )

        if not results:
            return AnswerResponse(
                queryText=req.queryText,
                answer="문서에서 근거를 찾지 못했습니다.",
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        chunk_ids = self._extract_chunk_ids(results)

        if not chunk_ids:
            return AnswerResponse(
                queryText=req.queryText,
                answer="문서에서 근거를 찾지 못했습니다. (검색 결과의 chunk_id 파싱 실패)",
                evidences=[],
                questionType=route.action.value,
                fromCache=False,
            )

        rows = self._load_chunks(chunk_ids)
        contexts, evidences = self._build_contexts_and_evidences(results, rows)

        if not contexts:
            return AnswerResponse(
                queryText=req.queryText,
                answer="문서에서 근거를 찾지 못했습니다. (DB에서 청크를 못 가져오거나 chunk_id 매칭 실패)",
                evidences=evidences,
                questionType=route.action.value,
                fromCache=False,
            )

        try:
            final_answer = self.llm.generate_answer(
                query=req.queryText,
                contexts=contexts,
                prompt_type=route.prompt_type,
                conversation_summary=req.conversationSummary,
                recent_messages=req.recentMessages,
                rewritten_query=rewritten_query,
            )
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
            questionType=route.action.value,
            fromCache=False,
        )

    def _rag_stream_answer(self, req: AnswerRequest, route) -> Iterator[dict[str, Any]]:
        """
        RAG_REQUIRED일 때 사용하는 스트리밍 답변 생성 함수.
        검색, 근거 전달, LLM token 전달을 순서대로 수행한다.
        """
        top_k = req.topK or route.top_k or 5

        yield {
            "type": "status",
            "message": "질문을 검색용으로 재작성하고 있습니다.",
        }

        rewritten_query = self.query_rewriter.rewrite(
            query=req.queryText,
            conversation_summary=req.conversationSummary,
            recent_messages=req.recentMessages,
        )

        self._log_query_rewrite(req, rewritten_query)

        yield {
            "type": "status",
            "message": "관련 문서를 검색하고 있습니다.",
        }

        results = self.index.search(
            workspace_id=req.workspaceId,
            query_text=rewritten_query,
            limit=top_k,
        )

        if not results:
            yield {
                "type": "token",
                "content": "문서에서 근거를 찾지 못했습니다.",
            }
            yield {"type": "done"}
            return

        chunk_ids = self._extract_chunk_ids(results)

        if not chunk_ids:
            yield {
                "type": "token",
                "content": "문서에서 근거를 찾지 못했습니다. 검색 결과의 chunk_id를 확인하지 못했습니다.",
            }
            yield {"type": "done"}
            return

        rows = self._load_chunks(chunk_ids)
        contexts, evidences = self._build_contexts_and_evidences(results, rows)

        if not contexts:
            yield {
                "type": "evidence",
                "evidences": self._evidences_to_stream(evidences),
            }
            yield {
                "type": "token",
                "content": "문서에서 근거를 찾지 못했습니다. DB에서 청크를 가져오지 못했거나 chunk_id 매칭에 실패했습니다.",
            }
            yield {"type": "done"}
            return

        yield {
            "type": "evidence",
            "evidences": self._evidences_to_stream(evidences),
        }

        yield {
            "type": "status",
            "message": "답변을 생성하고 있습니다.",
        }

        has_token = False

        try:
            for token in self.llm.stream_answer(
                query=req.queryText,
                contexts=contexts,
                prompt_type=route.prompt_type,
                conversation_summary=req.conversationSummary,
                recent_messages=req.recentMessages,
                rewritten_query=rewritten_query,
            ):
                if not token:
                    continue

                has_token = True

                yield {
                    "type": "token",
                    "content": token,
                }

            if not has_token:
                yield {
                    "type": "token",
                    "content": "답변 생성 실패",
                }

            yield {"type": "done"}

        except Exception as e:
            print("[LLM STREAM ERROR]", repr(e))
            yield {
                "type": "error",
                "code": "LLM_STREAM_ERROR",
                "message": f"LLM 스트리밍 호출 중 오류가 발생했습니다. ({type(e).__name__}: {e})",
            }

    def _build_context_response(self, req: AnswerRequest) -> str:
        recent_messages = req.recentMessages or []

        if not recent_messages:
            return "아직 이전 대화 내용이 충분하지 않습니다."

        lines = []

        for message in recent_messages:
            if hasattr(message, "role"):
                role = message.role
                content = message.content
            else:
                role = message.get("role")
                content = message.get("content")

            if not content:
                continue

            role_label = "사용자" if role == "user" else "Assistant"
            lines.append(f"{role_label}: {content}")

        if not lines:
            return "최근 대화 내용을 찾지 못했습니다."

        return "최근 대화 내용은 다음과 같습니다.\n\n" + "\n".join(lines[-6:])

    def _extract_chunk_ids(self, results) -> list[int]:
        chunk_ids = []

        for p in results:
            try:
                chunk_ids.append(int(p.id))
            except Exception:
                continue

        return chunk_ids

    def _load_chunks(self, chunk_ids: list[int]) -> dict[int, dict]:
        engine = get_engine()
        rows = get_chunks_by_ids(engine, chunk_ids)

        by_id = {}

        for r in rows:
            try:
                by_id[int(r["chunk_id"])] = r
            except Exception:
                continue

        return by_id

    def _build_contexts_and_evidences(self, results, by_id: dict[int, dict]):
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

        return contexts, evidences

    def _evidences_to_stream(self, evidences: list[Evidence]) -> list[dict[str, Any]]:
        result = []

        for evidence in evidences:
            if hasattr(evidence, "model_dump"):
                result.append(evidence.model_dump())
            else:
                result.append(evidence.dict())

        return result

    def _log_route(self, route) -> None:
        print(
            "[ROUTER]",
            {
                "action": route.action.value,
                "reason": route.reason,
                "top_k": route.top_k,
                "prompt_type": route.prompt_type,
                "confidence": route.confidence,
            },
        )

    def _log_query_rewrite(self, req: AnswerRequest, rewritten_query: str) -> None:
        print(
            "[QUERY REWRITE]",
            {
                "original": req.queryText,
                "rewritten": rewritten_query,
                "recentMessageCount": len(req.recentMessages or []),
            },
        )