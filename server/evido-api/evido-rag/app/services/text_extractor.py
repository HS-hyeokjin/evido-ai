import subprocess
from pathlib import Path
from typing import Optional

def _read_text_file(path: Path) -> str:
    for enc in ("utf-8", "utf-8-sig", "cp949", "euc-kr"):
        try:
            return path.read_text(encoding=enc)
        except Exception:
            continue
    return path.read_bytes().decode("utf-8", errors="ignore")

def _extract_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except Exception as e:
        raise RuntimeError("PDF 파싱에 pypdf가 필요합니다. pip install pypdf") from e

    reader = PdfReader(str(path))
    texts = []
    for page in reader.pages:
        t = page.extract_text() or ""
        if t.strip():
            texts.append(t)
    return "\n\n".join(texts).strip()

def _extract_docx(path: Path) -> str:
    try:
        import docx  # python-docx
    except Exception as e:
        raise RuntimeError("") from e

    doc = docx.Document(str(path))
    parts = []
    for p in doc.paragraphs:
        if p.text and p.text.strip():
            parts.append(p.text.strip())
    return "\n".join(parts).strip()

def _extract_image_ocr(path: Path) -> str:
    try:
        from PIL import Image
    except Exception as e:
        raise RuntimeError("") from e

    try:
        import pytesseract
    except Exception as e:
        raise RuntimeError("") from e

    img = Image.open(str(path))
    return (pytesseract.image_to_string(img, lang="kor+eng") or "").strip()

def _extract_hwp_with_tika(path: Path) -> Optional[str]:
    try:
        from tika import parser
    except Exception:
        return None

    parsed = parser.from_file(str(path))
    text = (parsed.get("content") or "").strip()
    return text if text else None

def _convert_hwp_to_pdf_with_libreoffice(path: Path) -> Optional[Path]:
    out_dir = path.parent
    try:
        subprocess.run(
            ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", str(out_dir), str(path)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception:
        return None

    pdf_path = out_dir / (path.stem + ".pdf")
    return pdf_path if pdf_path.exists() else None

def extract_text_from_local_file(file_path: str, content_type: Optional[str] = None) -> str:
    p = Path(file_path)

    if not p.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = p.suffix.lower().lstrip(".")

    if ext == "txt":
        return _read_text_file(p)

    if ext == "pdf":
        return _extract_pdf(p)

    if ext == "docx":
        return _extract_docx(p)

    if ext in ("jpg", "jpeg", "png"):
        return _extract_image_ocr(p)

    if ext == "hwp":
        t = _extract_hwp_with_tika(p)
        if t:
            return t

        pdf_path = _convert_hwp_to_pdf_with_libreoffice(p)
        if pdf_path:
            return _extract_pdf(pdf_path)

        raise RuntimeError(
            " "
            ""
        )

    # content-type 기반 fallback(확장자 없는 경우)
    if content_type:
        ct = content_type.lower()
        if "pdf" in ct:
            return _extract_pdf(p)
        if "word" in ct or "docx" in ct:
            return _extract_docx(p)
        if "text" in ct:
            return _read_text_file(p)
        if "image" in ct:
            return _extract_image_ocr(p)

    raise RuntimeError(f"Unsupported file type: .{ext} (contentType={content_type})")
