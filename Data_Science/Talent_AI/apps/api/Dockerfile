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

# Pre-download the embedding model at build time -- talent_ai_core/embeddings/
# embedder.py otherwise lazily downloads it from HuggingFace Hub on first use,
# which failed in production with a 429 (rate-limited, likely due to shared
# cloud-provider IPs). Baking it into the image means the container never
# makes that network call at runtime at all.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY talent_ai_core ./talent_ai_core
COPY app ./app

ENV PYTHONPATH=/app

EXPOSE 8000
# Shell form (not exec-form array) so $PORT actually expands -- Cloud Run sets
# PORT and requires the container to listen on whatever value it provides
# (defaults to 8080), unlike Render which tolerated a hardcoded port.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
