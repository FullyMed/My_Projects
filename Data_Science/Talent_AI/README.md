# Talent_AI — AI Talent Intelligence Platform

An AI-powered recruitment platform that parses resumes, extracts structured
candidate information, and semantically ranks candidates against a job description
— with a comparison against a traditional keyword-matching baseline.

Full concept: `AI_Talent_Intelligence_Platform_Project_Proposal.pdf` (project owner's copy).
This repo builds it in phases; see [Roadmap](#roadmap).

## Why a public dataset, and why anonymize

Resumes contain personal data (names, contact info). To keep this project safe to
publish and free of consent issues, it uses a public, pre-anonymized/categorized
Kaggle resume dataset rather than scraped or real resumes. On top of that, the
extraction step strips names/emails/phone numbers from the text *before* it's
embedded for matching, so ranking is driven by skills/experience content rather
than by names or contact details that could carry demographic signal.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Dataset download requires your own Kaggle API credentials (`kaggle.json`) — see
`scripts/download_dataset.py` for setup instructions if you don't have one yet.

OCR fallback (for scanned/image-based PDFs) requires the Tesseract binary installed
separately on your system (not just the `pytesseract` Python package) — see
https://github.com/UB-Mannheim/tesseract/wiki for the Windows installer. The
pipeline degrades gracefully (skips OCR, keeps whatever text PyMuPDF extracted)
if Tesseract isn't found, so this is optional for Phase 1.

## Usage

```bash
python scripts/download_dataset.py       # fetch the Kaggle resume dataset into Dataset/Raw
python scripts/build_index.py            # parse resumes -> profiles -> embeddings -> FAISS index
python scripts/rank_candidates.py --jd scripts/sample_jds/information_technology.txt
python scripts/evaluate.py               # Precision@K: semantic ranking vs. TF-IDF baseline
pytest tests/
```

Or step through `Notebooks/01_pipeline_walkthrough.ipynb`.

## Architecture (Phase 1)

```
Resume PDFs (Dataset/Raw)
  -> resume_parser.py       (PyMuPDF text extraction, OCR fallback)
  -> nlp_extractor.py       (spaCy: skills / education / experience)
  -> anonymize.py           (strip PII before embedding)
  -> embedder.py            (Sentence Transformers -> vector)
  -> ranker.py (FAISS)      (semantic similarity ranking against a JD)
       vs.
  -> baseline.py (TF-IDF)   (keyword-matching baseline, for comparison)
  -> evaluate.py            (Precision@K comparison of the two)
```

## Roadmap

- [x] **Phase 1 — Core matching pipeline**: PDF parsing, NLP extraction, embeddings,
      FAISS semantic ranking, TF-IDF baseline, Precision@K evaluation. *(this repo, now)*
- [ ] **Phase 2 — AI insights**: OpenAI-powered candidate summaries, strengths/weaknesses,
      missing-qualification detection, personalized interview questions.
- [ ] **Phase 3 — Dashboard**: Streamlit recruiter dashboard (upload JD, view rankings,
      drill into candidate profiles and AI insights).
- [ ] **Phase 4 — Automation**: folder watcher for new resumes, scheduled re-ranking,
      report generation, Dockerized deployment.

## Tech stack (current phase)

Python, PyMuPDF, pytesseract/Tesseract (optional OCR), spaCy, Sentence Transformers,
FAISS, scikit-learn (TF-IDF baseline), Pydantic, pandas/pyarrow.

Phase 2+ will add: OpenAI API, FastAPI or Streamlit, Docker.
