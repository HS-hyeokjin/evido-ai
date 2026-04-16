from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from fastapi import HTTPException


@dataclass
class ExtractedText:
    text: str
    source_type: str
    parse_method: str
    page_count: Optional[int] = None


def extract_text_from_local_file(file_path: str, content_type: str | None = None) -> ExtractedText:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".txt":
        return extract_txt(file_path)

    if suffix == ".pdf":
        return extract_pdf(file_path)

    if suffix == ".docx":
        return extract_docx(file_path)

    if suffix in [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"]:
        return extract_image_with_ocr(file_path)

    raise HTTPException(400, f"지원하지 않는 파일 형식입니다: {suffix}")


def extract_txt(file_path: str) -> ExtractedText:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="utf-8-sig") as f:
            text = f.read()
    except Exception as e:
        raise HTTPException(500, f"TXT 텍스트 추출 실패: {e}")

    return ExtractedText(
        text=text or "",
        source_type="txt",
        parse_method="plain",
    )


def extract_pdf(file_path: str) -> ExtractedText:
    try:
        from pypdf import PdfReader
    except ImportError:
        raise HTTPException(500, "pypdf 라이브러리가 필요합니다")

    try:
        reader = PdfReader(file_path)
        pages = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            pages.append(page_text)

        merged = "\n\n".join(pages).strip()

        # 텍스트 추출이 거의 안 된 스캔 PDF면 OCR fallback
        if len(merged) < 30:
            return extract_pdf_with_ocr(file_path)

        return ExtractedText(
            text=merged,
            source_type="pdf",
            parse_method="pdf_text",
            page_count=len(reader.pages),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"PDF 텍스트 추출 실패: {e}")


def extract_docx(file_path: str) -> ExtractedText:
    try:
        from docx import Document
    except ImportError:
        raise HTTPException(500, "python-docx 라이브러리가 필요합니다")

    try:
        doc = Document(file_path)
        paras = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
        text = "\n".join(paras)

        return ExtractedText(
            text=text,
            source_type="docx",
            parse_method="docx_text",
        )
    except Exception as e:
        raise HTTPException(500, f"DOCX 텍스트 추출 실패: {e}")


def extract_image_with_ocr(file_path: str) -> ExtractedText:
    try:
        from PIL import Image
        import pytesseract
    except ImportError:
        raise HTTPException(500, "OCR 사용을 위해 pillow, pytesseract 라이브러리가 필요합니다")

    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image, lang="kor+eng")

        return ExtractedText(
            text=text or "",
            source_type="image",
            parse_method="ocr",
        )
    except Exception as e:
        raise HTTPException(500, f"이미지 OCR 실패: {e}")


def extract_pdf_with_ocr(file_path: str) -> ExtractedText:
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except ImportError:
        raise HTTPException(500, "PDF OCR 사용을 위해 pdf2image, pytesseract 라이브러리가 필요합니다")

    try:
        images = convert_from_path(file_path)
        texts = []

        for img in images:
            txt = pytesseract.image_to_string(img, lang="kor+eng")
            texts.append(txt)

        merged = "\n\n".join(texts).strip()

        return ExtractedText(
            text=merged,
            source_type="pdf",
            parse_method="ocr",
            page_count=len(images),
        )
    except Exception as e:
        raise HTTPException(500, f"PDF OCR 실패: {e}")