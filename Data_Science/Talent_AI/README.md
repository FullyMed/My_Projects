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

### Phase 4 — Automation (folder watcher, scheduled reports, email, Docker)

```bash
python scripts/run_automation.py [--interval-minutes 30] [--top-k 10]
```

Runs two things together until you Ctrl+C:
- **Folder watcher**: drop a new resume PDF into `Dataset/Incoming/` and it's
  automatically parsed, extracted, anonymized, embedded, and added to the index —
  then moved into `Dataset/Raw/INCOMING/` so it's part of the permanent corpus.
  No OpenAI calls happen here; this only touches the free, local Phase 1 pipeline.
- **Scheduler**: every `--interval-minutes`, re-ranks the current candidate pool
  against every job description in `scripts/sample_jds/*.txt` and writes a
  timestamped Markdown report to `Dataset/Processed/Reports/`. Also free/local —
  the scheduler never calls the OpenAI API either, so it can run unattended
  without risk of runaway API cost. (AI Insights stay a manual, on-demand button
  in the dashboard, same as Phase 2/3.)

**Email notifications** (optional): set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`,
`SMTP_PASSWORD`, `SMTP_FROM`, and `RECRUITER_EMAIL` in `.env` and each cycle's
report gets emailed too. Without these set, the scheduler logs "SMTP not
configured, skipping" and keeps running — nothing breaks if you don't set up
email. Note: this emails the full report every cycle rather than diffing "what's
new since last time" — a deliberate scope simplification.

**Docker**: `Dockerfile` + `docker-compose.yml` containerize both the dashboard
and the automation daemon, sharing a `./Dataset` volume, with Tesseract/poppler
installed so OCR fully works in the container. Live-tested end-to-end: built
(~3.4GB image — see the CPU-only PyTorch note in the Dockerfile, without it this
balloons to ~10GB from unused CUDA libraries), ran both containers, hit the
dashboard's health endpoint, dropped a real resume into `Dataset/Incoming/` and
confirmed the containerized watcher indexed it, and confirmed the scheduler wrote
real reports. One real bug only surfaced here and got fixed: `watchdog`'s default
`Observer` relies on inotify events that don't reliably fire for a Windows-host
bind-mounted file write reaching the Linux container — `watcher.py` now uses
`PollingObserver` instead (same fix Streamlit's own dev-mode file watcher applies
automatically under WSL).

```bash
docker compose up -d          # starts both the dashboard (port 8501) and automation daemon
docker compose logs -f        # watch both services
docker compose down           # stop and remove both
```

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

Dataset/Incoming (new resumes)
  -> automation/watcher.py   (watchdog: detect -> indexing.py -> Dataset/Raw/INCOMING)
  -> automation/scheduler.py (periodic re-rank -> Dataset/Processed/Reports/*.md)
  -> automation/notifier.py  (optional: email the report via SMTP)
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
- [x] **Phase 4 — Automation**: `Dataset/Incoming/` folder watcher, scheduled
      re-ranking with Markdown report generation, optional email notifications,
      Dockerfile + docker-compose. All of it, including the Dockerized deployment,
      live-tested end-to-end (see the Docker section above).

## Tech stack

Python, PyMuPDF, pytesseract/Tesseract (optional OCR), spaCy, Sentence Transformers,
FAISS, scikit-learn (TF-IDF baseline), Pydantic, pandas/pyarrow, OpenAI API,
Streamlit, watchdog, Docker.
