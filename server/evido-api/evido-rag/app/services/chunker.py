import re
from typing import List

try:
    import tiktoken
    _ENC = tiktoken.get_encoding("cl100k_base")
    def count_tokens(s: str) -> int:
        return len(_ENC.encode(s))
except Exception:
    def count_tokens(s: str) -> int:
        return len(s.split())

_SENT_SPLIT = re.compile(r"(?:\n+|(?<=[.!?])\s+|(?<=다\.)\s+)")

def normalize_text(raw: str) -> str:
    if not raw:
        return ""
    t = raw.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"-\n(?=\w)", "", t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r" *\n *", "\n", t).strip()
    return t

def split_sentences(text: str) -> List[str]:
    return [p.strip() for p in _SENT_SPLIT.split(text) if p.strip()]

def chunk_text_token_based(
    raw_text: str,
    chunk_tokens: int = 450,
    overlap_tokens: int = 90,
    min_tokens: int = 120,
) -> List[dict]:
    text = normalize_text(raw_text)
    if not text:
        return []

    sents = split_sentences(text)

    chunks = []
    buf: List[str] = []
    buf_tokens = 0
    idx = 0

    for sent in sents:
        st = count_tokens(sent)

        if st > chunk_tokens:
            if buf:
                content = " ".join(buf).strip()
                chunks.append({"chunkIndex": idx, "tokenCount": count_tokens(content), "content": content})
                idx += 1
                buf, buf_tokens = [], 0

            step = max(400, len(sent) // 3)
            for i in range(0, len(sent), step):
                part = sent[i:i+step].strip()
                if part:
                    chunks.append({"chunkIndex": idx, "tokenCount": count_tokens(part), "content": part})
                    idx += 1
            continue

        if buf and (buf_tokens + st > chunk_tokens):
            content = " ".join(buf).strip()
            tc = count_tokens(content)

            if tc >= min_tokens or not chunks:
                chunks.append({"chunkIndex": idx, "tokenCount": tc, "content": content})
                idx += 1

            carry: List[str] = []
            total = 0
            for s in reversed(buf):
                ts = count_tokens(s)
                if total + ts > overlap_tokens:
                    break
                carry.append(s)
                total += ts
            buf = list(reversed(carry))
            buf_tokens = total

        buf.append(sent)
        buf_tokens += st

    if buf:
        content = " ".join(buf).strip()
        chunks.append({"chunkIndex": idx, "tokenCount": count_tokens(content), "content": content})

    return chunks
