"""PDF text extraction with an OCR fallback for scanned/image-based resumes."""

from __future__ import annotations

import logging
from pathlib import Path

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

MIN_TEXT_CHARS = 50
"""Below this many extracted characters, treat the PDF as likely scanned and try OCR."""


def extract_text(pdf_path: Path) -> str:
    """Extract text from a resume PDF, falling back to OCR if native extraction fails."""
    text = _extract_native_text(pdf_path)
    if len(text.strip()) >= MIN_TEXT_CHARS:
        return text

    ocr_text = _extract_via_ocr(pdf_path)
    return ocr_text if len(ocr_text.strip()) > len(text.strip()) else text


def _extract_native_text(pdf_path: Path) -> str:
    with fitz.open(pdf_path) as doc:
        return "\n".join(page.get_text() for page in doc)


def _extract_via_ocr(pdf_path: Path) -> str:
    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError:
        logger.warning("OCR dependencies not installed; skipping OCR for %s", pdf_path)
        return ""

    try:
        images = convert_from_path(str(pdf_path))
        return "\n".join(pytesseract.image_to_string(image) for image in images)
    except Exception as exc:  # Tesseract binary or poppler missing, corrupt PDF, etc.
        logger.warning("OCR failed for %s (%s) — is Tesseract/poppler installed?", pdf_path, exc)
        return ""
