import os
import json
import re
from typing import Any

from groq import Groq

from app.schemas.router import RouteResult, RouteAction


class QuestionRouter:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY 환경변수가 설정되지 않았습니다.")

        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv(
            "GROQ_ROUTER_MODEL",
            os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        )
        self.timeout = float(os.getenv("GROQ_ROUTER_TIMEOUT", "30"))
        self.max_tokens = int(os.getenv("GROQ_ROUTER_MAX_TOKENS", "400"))

    def route(
        self,
        query: str,
        conversation_summary: str | None = None,
        recent_messages: list | None = None,
    ) -> RouteResult:
        query = (query or "").strip()
        recent_messages = recent_messages or []

        if not query:
            return RouteResult(
                action=RouteAction.CLARIFY,
                reason="빈 질문입니다.",
                response="질문을 입력해 주세요.",
                top_k=0,
                prompt_type="qa",
                confidence=1.0,
            )

        recent_text = self._format_recent_messages(recent_messages)

        system = """
너는 문서 기반 QA 서비스의 라우터다.

사용자 질문을 보고 다음 중 하나로 분류해라.

BASIC_RESPONSE:
- 인사, 감사, 서비스 사용법 질문
- 문서 검색이나 이전 대화 확인이 필요 없는 질문

CONTEXT_RESPONSE:
- 이전 대화, 최근 메시지, 방금 한 말, 지금까지의 대화 내용을 묻는 질문
- 예: "내가 이전에 무슨 말 했지?", "방금 뭐라고 했어?", "지금까지 내용 정리해줘"
- 문서 검색이 아니라 [최근 대화] 또는 [대화 요약]만 보고 답변해야 하는 질문

RAG_REQUIRED:
- 업로드된 문서 내용에 대해 묻는 질문
- 문서 요약, 핵심 정리, 비교, 특정 내용 찾기 포함
- "그중", "그거", "위 내용" 같은 표현이 있어도 문서 내용에 대한 후속 질문이면 RAG_REQUIRED

CLARIFY:
- 최근 대화로도, 문서 검색으로도 의도를 알기 어려운 질문

OUT_OF_SCOPE:
- 업로드 문서와 무관하고, 최근 대화와도 무관한 최신 정보, 날씨, 주가, 뉴스, 일반 지식 질문

중요한 규칙:
- 최근 대화가 있는데 사용자가 "이전", "방금", "아까", "내가 무슨 말"을 물으면 CLARIFY가 아니라 CONTEXT_RESPONSE를 선택해라.
- 문서 내용에 대한 후속 질문이면 CLARIFY가 아니라 RAG_REQUIRED를 선택해라.
- 헷갈리면 BASIC_RESPONSE가 아니라 RAG_REQUIRED를 선택해라.
- 반드시 JSON만 반환해라.
- JSON 이외의 설명 문장, 마크다운, 코드블록을 절대 붙이지 마라.
"""

        user = f"""
[대화 요약]
{conversation_summary or "없음"}

[최근 대화]
{recent_text or "없음"}

[사용자 질문]
{query}

아래 JSON 형식으로만 답해라.

{{
  "action": "BASIC_RESPONSE | CONTEXT_RESPONSE | RAG_REQUIRED | CLARIFY | OUT_OF_SCOPE",
  "reason": "짧은 판단 이유",
  "response": "BASIC_RESPONSE, CONTEXT_RESPONSE, CLARIFY, OUT_OF_SCOPE일 때 사용자에게 보여줄 답변. RAG_REQUIRED이면 null",
  "top_k": 5,
  "prompt_type": "qa | summary | comparison | search",
  "confidence": 0.8
}}
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0,
                max_tokens=self.max_tokens,
                top_p=1,
                timeout=self.timeout,
            )

            content = response.choices[0].message.content or "{}"
            data = self._loads_json(content)

            result = RouteResult(**data)

            if result.confidence < 0.6:
                return self._fallback(
                    reason="라우터 신뢰도가 낮아 RAG 검색으로 fallback합니다.",
                    confidence=result.confidence,
                )

            return result

        except Exception as e:
            print("[ROUTER ERROR]", repr(e))
            return self._fallback(
                reason="Groq 라우터 처리 실패로 RAG 검색으로 fallback합니다.",
                confidence=0.0,
            )

    def _fallback(self, reason: str, confidence: float) -> RouteResult:
        return RouteResult(
            action=RouteAction.RAG_REQUIRED,
            reason=reason,
            response=None,
            top_k=5,
            prompt_type="qa",
            confidence=confidence,
        )

    def _format_recent_messages(self, recent_messages: list) -> str:
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

            lines.append(f"{role}: {content}")

        return "\n".join(lines)

    def _loads_json(self, content: str) -> dict[str, Any]:
        content = (content or "").strip()

        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?", "", content).strip()
            content = re.sub(r"```$", "", content).strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                raise

            return json.loads(match.group(0))