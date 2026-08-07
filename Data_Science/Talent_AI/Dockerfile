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
# Install CPU-only PyTorch first. sentence-transformers pulls in torch as a
# dependency, and without this, pip resolves the default (CUDA-enabled) build --
# several GB of GPU libraries this container never uses, since it only ever does
# CPU inference. Pre-satisfying the dependency here keeps the image lean.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
# en_core_web_sm is installed via its direct wheel URL in requirements.txt, not
# a separate `spacy download` step -- keeps this identical to how Streamlit
# Community Cloud installs it (it has no hook for a post-install command).
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app/dashboard.py", "--server.address=0.0.0.0", "--server.port=8501"]
