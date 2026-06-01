import os
from typing import List

from groq import Groq

from app.schemas.conversation_summary import ConversationSummaryMessage


class ConversationSummarizer:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY 환경변수가 설정되지 않았습니다.")

        self.client = Groq(api_key=self.api_key)

        self.model = os.getenv(
            "GROQ_SUMMARY_MODEL",
            os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        )

        self.timeout = float(os.getenv("GROQ_SUMMARY_TIMEOUT", "60"))
        self.max_tokens = int(os.getenv("GROQ_SUMMARY_MAX_TOKENS", "700"))
        self.max_message_chars = int(os.getenv("SUMMARY_MESSAGE_MAX_CHARS", "1200"))

    def summarize(
        self,
        old_summary: str | None,
        messages: List[ConversationSummaryMessage]
    ) -> str:
        if not messages:
            return old_summary or ""

        message_text = self._format_messages(messages)

        system = """
너는 대화 요약기다.

역할:
- 기존 요약과 새로 추가된 대화를 합쳐서 하나의 최신 요약으로 갱신한다.
- 사용자의 프로젝트 진행 상황, 결정사항, 구현한 기능, 다음 작업에 필요한 맥락을 중심으로 요약한다.
- 불필요한 인사, 잡담, 반복 표현은 제외한다.
- 너무 길게 쓰지 말고, 다음 질문 이해에 필요한 정보만 남긴다.
- 한국어로 작성한다.
"""

        user = f"""
[기존 요약]
{old_summary or "없음"}

[새로 추가된 대화]
{message_text}

[요약 규칙]
- 기존 요약을 유지하되, 새 대화에서 중요한 내용을 반영해 갱신해라.
- 이미 완료한 작업과 앞으로 해야 할 작업을 구분해서 이해할 수 있게 요약해라.
- 사용자의 코드 구조나 기술 선택이 중요하면 포함해라.
- 문장형 또는 짧은 bullet 형식으로 작성해라.
- 요약문만 출력해라.
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.2,
            max_tokens=self.max_tokens,
            top_p=0.9,
            timeout=self.timeout,
        )

        summary = response.choices[0].message.content

        return summary.strip() if summary else (old_summary or "")

    def _format_messages(self, messages: List[ConversationSummaryMessage]) -> str:
        lines = []

        for message in messages:
            role = (message.role or "").strip()
            content = (message.content or "").strip()

            if not content:
                continue

            if len(content) > self.max_message_chars:
                content = content[:self.max_message_chars] + "..."

            lines.append(f"{role}: {content}")

        return "\n".join(lines) if lines else "없음"