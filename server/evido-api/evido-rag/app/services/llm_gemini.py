import os
from typing import List, Dict
from google import genai

class GeminiLLM:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        self.client = genai.Client(api_key=api_key)
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    def generate_answer(self, query: str, contexts: List[Dict]) -> str:
        context_block = "\n\n".join(
            [f"[chunk_id={c['chunkId']}] {c['content']}" for c in contexts]
        )

        prompt = f"""
너는 문서 기반 Q&A 어시스턴트야.
아래 [CONTEXT]만 근거로 답변해.
- 추측/상상 금지.
- 답변은 한국어로 간결하게.
- 마지막 줄에 근거 chunk_id를 1~3개로 적어줘. (예: 근거: 12, 15)

[QUESTION]
{query}

[CONTEXT]
{context_block}
""".strip()

        resp = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        print("RAW RESP:", resp)
        print("TEXT:", getattr(resp, "text", None))

        return (resp.text or "").strip() or "문서에서 근거를 찾지 못했습니다."
