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

    def generate_answer(self, query: str, contexts: List[Dict[str, Any]]) -> str:
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

            header = f"[근거 {i}] chunkId={chunk_id if chunk_id is not None else '?'} score={score if score is not None else '?'}"

            evidence_texts.append(f"{header}\n{txt}")

        context_block = "\n\n".join(evidence_texts) if evidence_texts else "(근거 없음)"

        system = (
            "너는 문서 기반 Q&A 어시스턴트다.\n"
            "기본 원칙:\n"
            "1) 제공된 Context(근거)를 우선적으로 참고한다.\n"
            "2) Context에 없는 내용도 일반 상식 범위 내에서 보완 설명해도 된다.\n"
            "3) 최대한 길게 작성한다.\n"
            "4) 문서에 명시된 수치, 조건, 주기 등은 가능한 정확히 유지한다.\n"
            "5) 지나치게 딱딱한 보고서 형식보다는 이해하기 쉬운 설명형으로 작성한다.\n"
            "6) 답변은 한국어로 작성한다.\n"
        )

        user = (
            f"질문: {query}\n\n"
            f"Context:\n{context_block}\n\n"
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.4,
            max_tokens=self.num_predict,
            top_p=0.9,
        )

        answer = response.choices[0].message.content

        return answer.strip() if answer else "답변 생성 실패"