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

### Phase 2 — AI insights (requires an OpenAI API key)

1. Get a key at platform.openai.com (Settings -> API keys) — this is a separate,
   billed-per-use developer credential, not your ChatGPT login.
2. `cp .env.example .env` and set `OPENAI_API_KEY=sk-...` in `.env` (never commit this file).
3. Run:

```bash
python scripts/generate_insights.py --jd scripts/sample_jds/information_technology.txt --top-k 5
```

This generates a summary, strengths/weaknesses, missing qualifications, a hiring
recommendation, and interview questions for the top-K ranked candidates — deliberately
scoped to a shortlist (not the whole dataset) to keep API cost bounded and to mirror
how a recruiter would actually use it. Uses `gpt-4o-mini` by default (override with
`OPENAI_MODEL` in `.env`) and only ever sends the anonymized resume text (see below),
never the original with names/contact info.

### Phase 3 — Recruiter dashboard

```bash
streamlit run app/dashboard.py
```

Interactive version of the same pipeline: pick a sample job description or paste
your own, choose semantic ranking / TF-IDF baseline / side-by-side comparison,
browse ranked candidates, and click "Generate AI Insights" on any candidate to run
Phase 2's LLM analysis for just that one candidate. AI Insights are always
on-demand (a button per candidate) rather than auto-generated for the whole
shortlist — Streamlit reruns the script on every UI interaction, so auto-generating
would silently multiply OpenAI API calls. Requires `Dataset/Processed/candidates.parquet`
to already exist (run `scripts/build_index.py` first) and, for the AI Insights
button, the same `OPENAI_API_KEY` setup as Phase 2 above.

## Architecture

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
       |
       v (top-K shortlist only)
  -> insight_generator.py   (OpenAI: summary, strengths/weaknesses, missing quals,
                              hiring recommendation, interview questions)
       |
       v
  -> app/dashboard.py       (Streamlit: interactive JD input, rankings, on-demand
                              AI insights per candidate)
```

## Roadmap

- [x] **Phase 1 — Core matching pipeline**: PDF parsing, NLP extraction, embeddings,
      FAISS semantic ranking, TF-IDF baseline, Precision@K evaluation. Validated
      end-to-end on the real 2,483-resume dataset.
- [x] **Phase 2 — AI insights**: OpenAI-powered candidate summaries, strengths/weaknesses,
      missing-qualification detection, hiring recommendations, personalized interview
      questions — one combined structured call per candidate, scoped to a ranked
      shortlist. Live-tested end-to-end with a real OpenAI account.
- [x] **Phase 3 — Dashboard**: Streamlit recruiter dashboard — pick/paste a job
      description, view semantic/TF-IDF/side-by-side rankings, drill into candidate
      profiles, generate AI insights on demand per candidate.
- [ ] **Phase 4 — Automation**: folder watcher for new resumes, scheduled re-ranking,
      report generation, Dockerized deployment.

## Tech stack (current phase)

Python, PyMuPDF, pytesseract/Tesseract (optional OCR), spaCy, Sentence Transformers,
FAISS, scikit-learn (TF-IDF baseline), Pydantic, pandas/pyarrow, OpenAI API, Streamlit.

Phase 4 will add: Docker, watchdog.
