FROM python:3.11-slim

# tesseract-ocr + poppler-utils: OCR fallback for scanned resumes
# (talent_ai_core/parsing/resume_parser.py's _extract_via_ocr).
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY talent_ai_core ./talent_ai_core
COPY app ./app

ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
