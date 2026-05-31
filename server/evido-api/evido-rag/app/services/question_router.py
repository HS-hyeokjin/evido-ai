# app/services/question_router.py

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

        # 라우터 전용 모델. 없으면 기존 GROQ_MODEL 사용
        self.model = os.getenv(
            "GROQ_ROUTER_MODEL",
            os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        )

        self.timeout = float(os.getenv("GROQ_ROUTER_TIMEOUT", "30"))
        self.max_tokens = int(os.getenv("GROQ_ROUTER_MAX_TOKENS", "300"))

    def route(self, query: str) -> RouteResult:
        query = (query or "").strip()

        if not query:
            return RouteResult(
                action=RouteAction.CLARIFY,
                reason="빈 질문입니다.",
                response="질문을 입력해 주세요.",
                top_k=0,
                prompt_type="qa",
                confidence=1.0,
            )

        system = """
            너는 문서 기반 QA 서비스의 라우터다.
            
            사용자 질문을 보고 다음 중 하나로 분류해라.
            
            BASIC_RESPONSE:
            - 인사, 감사, 사용법 질문
            - 문서 검색이 필요 없는 질문
            
            RAG_REQUIRED:
            - 업로드된 문서 내용에 대해 묻는 질문
            - 문서 요약, 핵심 정리, 비교, 특정 내용 찾기 포함
            
            CLARIFY:
            - 질문이 너무 짧거나 모호해서 검색하기 어려운 경우
            
            OUT_OF_SCOPE:
            - 업로드 문서와 무관한 최신 정보, 날씨, 주가, 뉴스, 일반 지식 질문
            
            중요한 규칙:
            - 헷갈리면 BASIC_RESPONSE가 아니라 RAG_REQUIRED를 선택해라.
            - 사용자가 "이 문서", "내용", "요약", "정리", "찾아줘", "비교해줘"라고 하면 RAG_REQUIRED일 가능성이 높다.
            - 반드시 JSON만 반환해라.
            - JSON 이외의 설명 문장, 마크다운, 코드블록을 절대 붙이지 마라.
            """

        user = f"""
        사용자 질문: {query}

    아래 JSON 형식으로만 답해라.
    
    {{
      "action": "BASIC_RESPONSE | RAG_REQUIRED | CLARIFY | OUT_OF_SCOPE",
      "reason": "짧은 판단 이유",
      "response": "사용자에게 바로 보여줄 답변. RAG_REQUIRED이면 null",
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