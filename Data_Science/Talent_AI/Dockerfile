FROM python:3.11-slim

# poppler-utils + tesseract-ocr: the OCR fallback (parsing/resume_parser.py) has
# been gracefully degrading around these being absent in local dev -- install them
# for real here so OCR actually works in the deployed container.
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app/dashboard.py", "--server.address=0.0.0.0", "--server.port=8501"]
