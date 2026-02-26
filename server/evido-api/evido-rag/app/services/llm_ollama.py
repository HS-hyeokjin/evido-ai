import os
import requests
from typing import List, Dict, Any


class OllamaLLM:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
        self.model = os.getenv("OLLAMA_MODEL", "llama3")
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT", "60"))

        self.max_evidence_chunks = int(os.getenv("EVIDENCE_TOPK", "8"))          # 근거 개수
        self.max_chars_per_chunk = int(os.getenv("EVIDENCE_MAX_CHARS", "1100"))  # 청크당 최대 길이
        self.num_predict = int(os.getenv("OLLAMA_NUM_PREDICT", "600"))           # 답변 길이(토큰)

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
#        "3) 다만, 문서 근거인지 일반 설명인지 자연스럽게 구분해서 표현한다.\n"
        "3) 최대한 길게 작성한다.\n"
        "4) 문서에 명시된 수치, 조건, 주기 등은 가능한 정확히 유지한다.\n"
        "5) 지나치게 딱딱한 보고서 형식보다는 이해하기 쉬운 설명형으로 작성한다.\n"
        "6) 답변은 한국어로 작성한다.\n"
      )

      user = (
        f"질문: {query}\n\n"
        f"Context:\n{context_block}\n\n"
        # "출력 형식:\n"
        # "[답변]\n"
        # "- 핵심 내용을 자연스럽게 설명 (5~15줄)\n\n"
        # "[문서 근거 요약]\n"
        # "- 사용된 근거가 있다면 간단히 정리 (없으면 '직접 근거 없음'이라고 표기)\n\n"
        # "[추가 설명]\n"
        # "- 문서 밖 일반 설명이나 실무 팁이 있다면 정리\n"
      )

      payload = {
        "model": self.model,
        "messages": [
          {"role": "system", "content": system},
          {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {
          "temperature": 0.4,
          "top_p": 0.9,
          "repeat_penalty": 1.1,
          "num_predict": self.num_predict,
        },
      }

      r = requests.post(
        f"{self.base_url}/api/chat",
        json=payload,
        timeout=self.timeout,
      )
      r.raise_for_status()
      data = r.json()

      return (data.get("message", {}) or {}).get("content", "").strip() or "답변 생성 실패"