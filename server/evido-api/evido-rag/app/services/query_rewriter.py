import os
from groq import Groq


class QueryRewriter:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY 환경변수가 설정되지 않았습니다.")

        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv("GROQ_REWRITE_MODEL", os.getenv("GROQ_ROUTER_MODEL", "llama-3.1-8b-instant"))
        self.timeout = float(os.getenv("GROQ_REWRITE_TIMEOUT", "30"))

    def rewrite(self, query: str, conversation_summary: str | None, recent_messages: list | None) -> str:
        query = (query or "").strip()

        if not query:
            return query

        recent_messages = recent_messages or []

        if not conversation_summary and not recent_messages:
            return query

        recent_text = self._format_recent_messages(recent_messages)

        system = """
                너는 문서 기반 RAG 검색을 위한 질문 재작성기다.
                
                역할:
                - 사용자의 현재 질문이 이전 대화에 의존하면, 검색하기 좋은 독립 질문으로 바꾼다.
                - 이미 독립적인 질문이면 원문을 거의 그대로 유지한다.
                - 답변하지 말고, 재작성된 검색 질문만 출력한다.
                - 한국어로 작성한다.
                """

        user = f"""
                [대화 요약]
                {conversation_summary or "없음"}
                
                [최근 대화]
                {recent_text or "없음"}
                
                [현재 질문]
                {query}

                [재작성 규칙]
                - "그중", "그거", "아까", "위 내용", "앞에서 말한" 같은 표현이 있으면 최근 대화를 반영해 구체화해라.
                - 문서 검색에 필요한 핵심 키워드를 포함해라.
                - 불필요한 설명은 하지 마라.
                - 재작성된 질문만 한 줄로 출력해라.
                """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0,
                max_tokens=200,
                top_p=1,
                timeout=self.timeout,
            )

            rewritten = response.choices[0].message.content

            if not rewritten:
                return query

            return rewritten.strip().strip('"')

        except Exception as e:
            print("[QUERY REWRITER ERROR]", repr(e))
            return query

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