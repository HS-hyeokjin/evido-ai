import re


def normalize_text(raw: str, source_type: str, parse_method: str) -> str:
    if not raw:
        return ""

    if source_type == "txt":
        return normalize_txt(raw)

    if source_type == "pdf":
        return normalize_pdf(raw, parse_method)

    if source_type == "docx":
        return normalize_docx(raw)

    if source_type == "image":
        return normalize_ocr(raw)

    return normalize_plain(raw)


def normalize_plain(raw: str) -> str:
    t = raw.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def normalize_txt(raw: str) -> str:
    return normalize_plain(raw)


def normalize_docx(raw: str) -> str:
    return normalize_plain(raw)


def normalize_pdf(raw: str, parse_method: str) -> str:
    t = raw.replace("\r\n", "\n").replace("\r", "\n")

    if parse_method == "pdf_text":
        t = re.sub(r"(?<!\n)\n(?!\n)", " ", t)

    t = re.sub(r"(\w)-\s+(\w)", r"\1\2", t)

    t = re.sub(r"[ \t]+", " ", t)

    t = re.sub(r"\n{3,}", "\n\n", t)

    return t.strip()


def normalize_ocr(raw: str) -> str:
    t = raw.replace("\r\n", "\n").replace("\r", "\n")

    t = re.sub(r"[|]+", " ", t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)

    return t.strip()