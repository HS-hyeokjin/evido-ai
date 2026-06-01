import os
from typing import List, Dict, Any
from groq import Groq


class GroqLLM:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY 환경변수가 설정되지 않았습니다.")

        self.client = Groq(api_key=self.api_key)

        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.timeout = float(os.getenv("GROQ_TIMEOUT", "60"))

        self.max_evidence_chunks = int(os.getenv("EVIDENCE_TOPK", "8"))
        self.max_chars_per_chunk = int(os.getenv("EVIDENCE_MAX_CHARS", "1100"))
        self.num_predict = int(os.getenv("GROQ_NUM_PREDICT", "600"))

    def generate_answer(
            self,
            query: str,
            contexts: List[Dict[str, Any]],
            prompt_type: str = "qa",
            conversation_summary: str | None = None,
            recent_messages: list | None = None,
            rewritten_query: str | None = None,
    ) -> str:

        top = (contexts or [])[: self.max_evidence_chunks]

        evidence_texts = []

        for i, c in enumerate(top, start=1):
            txt = (c.get("content") or "").strip()
            if not txt:
                continue

            if len(txt) > self.max_chars_per_chunk:
                txt = txt[: self.max_chars_per_chunk] + "..."

            chunk_id = c.get("chunkId")
            score = c.get("score")
            chunk_index = c.get("chunkIndex")

            header = (
                f"[근거 {i}] "
                f"chunkId={chunk_id if chunk_id is not None else '?'} "
                f"chunkIndex={chunk_index if chunk_index is not None else '?'} "
                f"score={score if score is not None else '?'}"
            )

            evidence_texts.append(f"{header}\n{txt}")

        context_block = "\n\n".join(evidence_texts) if evidence_texts else "(근거 없음)"

        system = self._build_system_prompt(prompt_type)
        recent_text = self._format_recent_messages(recent_messages)

        user = (
            f"[대화 요약]\n"
            f"{conversation_summary or '없음'}\n\n"

            f"[최근 대화]\n"
            f"{recent_text}\n\n"

            f"[현재 질문]\n"
            f"{query}\n\n"

            f"[검색용으로 재작성된 질문]\n"
            f"{rewritten_query or query}\n\n"

            f"[문서 근거]\n"
            f"{context_block}\n\n"

            f"[답변]"
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=self._temperature_by_prompt_type(prompt_type),
            max_tokens=self.num_predict,
            top_p=0.9,
            timeout=self.timeout,
        )

        answer = response.choices[0].message.content

        return answer.strip() if answer else "답변 생성 실패"

    def _build_system_prompt(self, prompt_type: str) -> str:
        base = (
            "너는 문서 기반 Q&A 어시스턴트다.\n"
            "기본 원칙:\n"
            "1) 제공된 [문서 근거]를 최우선으로 사용한다.\n"
            "2) [대화 요약]과 [최근 대화]는 사용자의 질문 의도를 이해하는 데만 사용한다.\n"
            "3) 문서 근거에 없는 내용은 추측하지 말고, 문서에서 확인되지 않는다고 말한다.\n"
            "4) 문서에 명시된 수치, 조건, 주기, 절차는 가능한 정확히 유지한다.\n"
            "5) 답변은 한국어로 작성한다.\n"
            "6) 지나치게 딱딱한 보고서 형식보다는 이해하기 쉽게 설명한다.\n"
        )

        if prompt_type == "summary":
            return (
                base
                + "\n너의 작업은 문서 내용을 요약하는 것이다.\n"
                "답변 형식:\n"
                "- 핵심 요약\n"
                "- 주요 내용\n"
                "- 실무적으로 중요한 부분\n"
                "문서 근거에 없는 내용은 추가하지 마라.\n"
            )

        if prompt_type == "comparison":
            return (
                base
                + "\n너의 작업은 질문에서 요구한 항목들을 비교하는 것이다.\n"
                "답변 형식:\n"
                "- 공통점\n"
                "- 차이점\n"
                "- 결론\n"
                "문서 근거에 없는 비교 내용은 추측하지 마라.\n"
            )

        if prompt_type == "search":
            return (
                base
                + "\n너의 작업은 사용자가 찾는 내용이 문서 근거에 있는지 확인하고 설명하는 것이다.\n"
                "답변 형식:\n"
                "- 찾은 내용\n"
                "- 관련 근거 요약\n"
                "- 문서에서 확인되지 않는 부분\n"
            )

        return (
            base
            + "\n너의 작업은 사용자의 질문에 대해 문서 근거를 바탕으로 자연스럽게 답변하는 것이다.\n"
        )

    def _temperature_by_prompt_type(self, prompt_type: str) -> float:
        if prompt_type == "summary":
            return 0.2

        if prompt_type == "search":
            return 0.1

        if prompt_type == "comparison":
            return 0.2

        return 0.3

    def _format_recent_messages(self, recent_messages: list | None) -> str:
        if not recent_messages:
            return "없음"

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

        return "\n".join(lines) if lines else "없음"