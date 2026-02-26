import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

try:
    import tiktoken
    _ENC = tiktoken.get_encoding("cl100k_base")

    def count_tokens(s: str) -> int:
        return len(_ENC.encode(s))
except Exception:
    _ENC = None

    def count_tokens(s: str) -> int:
        return len(s.split())


def normalize_text_txt(raw: str) -> str:
    if not raw:
        return ""
    t = raw.replace("\r\n", "\n").replace("\r", "\n")

    t = re.sub(r"[ \t]+", " ", t)

    t = re.sub(r"\n{3,}", "\n\n", t)

    return t.strip()


_HEADER_LINE_RE = re.compile(
    r"""(?mx)
    ^\s*(?:
        (제\s*\d+\s*(장|절|항|조))
        |
        (\d{1,3}(?:\.\d{1,3}){0,3})\.\s+
        |
        (\d{1,3})\)\s+
        |
        \[[^\]]{1,30}\]\s*
    )
    """,
)

_HEADER_INLINE_RE = re.compile(r"\s(?=(\d{1,3}(?:\.\d{1,3}){0,3})\.\s+)")


def split_sections_txt(text: str) -> List[str]:
    t = text.strip()
    if not t:
        return []

    parts = re.split(
        r"(?m)(?=^\s*(?:제\s*\d+\s*(?:장|절|항|조)|\d{1,3}(?:\.\d{1,3}){0,3}\.\s+|\d{1,3}\)\s+|\[[^\]]{1,30}\]\s*))",
        t
    )
    parts = [p.strip() for p in parts if p and p.strip()]

    if len(parts) <= 2:
        parts = re.split(_HEADER_INLINE_RE, t)
        parts = [p.strip() for p in parts if p and p.strip()]

    if len(parts) <= 1:
        parts = re.split(r"\n\s*\n", t)
        parts = [p.strip() for p in parts if p.strip()]

    return parts


_SENT_SPLIT = re.compile(r"(?:(?<=[.!?])\s+|(?<=다\.)\s+)")


def split_units_txt(section: str) -> List[str]:
    units: List[str] = []
    for line in section.split("\n"):
        line = line.strip()
        if not line:
            continue

        if line.startswith(("-", "•", "*")):
            units.append(line)
            continue

        parts = [p.strip() for p in _SENT_SPLIT.split(line) if p.strip()]
        units.extend(parts)
    return units


def chunk_within_section(
    section_text: str,
    chunk_tokens: int,
    overlap_tokens: int,
    min_tokens: int,
) -> List[Dict]:
    units = split_units_txt(section_text)
    if not units:
        return []

    chunks: List[Dict] = []
    buf: List[str] = []
    buf_tokens = 0

    def flush_buf():
        nonlocal buf, buf_tokens
        if not buf:
            return
        content = "\n".join(buf).strip()
        tc = count_tokens(content)
        if tc >= min_tokens or not chunks:
            chunks.append({"tokenCount": tc, "content": content})
        buf = []
        buf_tokens = 0

    for u in units:
        ut = count_tokens(u)

        if ut > chunk_tokens:
            flush_buf()

            if _ENC is not None:
                toks = _ENC.encode(u)
                step = chunk_tokens
                for i in range(0, len(toks), step):
                    part = _ENC.decode(toks[i:i + step]).strip()
                    if part:
                        chunks.append({"tokenCount": count_tokens(part), "content": part})
            else:
                words = u.split()
                step = max(int(chunk_tokens * 0.8), 50)
                for i in range(0, len(words), step):
                    part = " ".join(words[i:i + step]).strip()
                    if part:
                        chunks.append({"tokenCount": count_tokens(part), "content": part})
            continue

        if buf and (buf_tokens + ut > chunk_tokens):
            content = "\n".join(buf).strip()
            tc = count_tokens(content)
            if tc >= min_tokens or not chunks:
                chunks.append({"tokenCount": tc, "content": content})

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

        buf.append(u)
        buf_tokens += ut

    flush_buf()
    return chunks


def chunk_text_token_based(
    raw_text: str,
    chunk_tokens: int = 250,
    overlap_tokens: int = 40,
    min_tokens: int = 40,
) -> List[Dict]:
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug("[청킹] 원문 줄바꿈 개수=%s", raw_text.count("\n"))
        logger.debug("[청킹] 원문 앞부분(repr)=%s", repr(raw_text[:200]))

    text = normalize_text_txt(raw_text)
    if not text:
        logger.info("[청킹] 정규화 결과가 비어있어 청킹을 생략합니다.")
        return []

    sections = split_sections_txt(text)

    logger.info(
        "[청킹] 섹션 분리 완료 (섹션 수=%s, 설정: chunk_tokens=%s overlap_tokens=%s min_tokens=%s)",
        len(sections), chunk_tokens, overlap_tokens, min_tokens
    )

    chunks: List[Dict] = []
    idx = 0

    for sec in sections:
        sec_tokens = count_tokens(sec)

        if sec_tokens <= chunk_tokens:
            chunks.append({
                "chunkIndex": idx,
                "tokenCount": sec_tokens,
                "content": sec
            })
            idx += 1
            continue

        sub = chunk_within_section(
            sec,
            chunk_tokens=chunk_tokens,
            overlap_tokens=overlap_tokens,
            min_tokens=min_tokens,
        )

        for c in sub:
            chunks.append({
                "chunkIndex": idx,
                "tokenCount": c["tokenCount"],
                "content": c["content"]
            })
            idx += 1

    logger.info("[청킹] 청킹 완료 (총 청크 수=%s)", len(chunks))
    return chunks
