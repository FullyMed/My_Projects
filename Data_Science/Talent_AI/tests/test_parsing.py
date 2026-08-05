import fitz

from talent_ai.parsing.resume_parser import extract_text


def _make_pdf(tmp_path, text: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    pdf_path = tmp_path / "resume.pdf"
    doc.save(pdf_path)
    doc.close()
    return pdf_path


def test_extract_text_native(tmp_path):
    pdf_path = _make_pdf(tmp_path, "John Doe - Python Developer")
    text = extract_text(pdf_path)
    assert "Python Developer" in text
