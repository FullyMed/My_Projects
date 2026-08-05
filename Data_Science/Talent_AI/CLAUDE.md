# Talent_AI — Project Instructions

AI Talent Intelligence Platform: parses resumes, extracts structured candidate data,
and ranks candidates against a job description using semantic embeddings, with a
TF-IDF baseline for comparison. Full concept in the project owner's
`AI_Talent_Intelligence_Platform_Project_Proposal.pdf`. See `README.md` for setup,
usage, and the phased roadmap (Phase 1 = core pipeline, done; Phases 2-4 = LLM
insights, dashboard, automation — not yet built).

## Key decisions (don't relitigate without asking)

- **Embeddings**: Sentence Transformers (local, free, reproducible) — not OpenAI
  embeddings. Keeps the core pipeline runnable with zero API cost/keys.
- **Generative LLM tasks** (Phase 2: summaries, interview questions): OpenAI API.
  Kept separate from embeddings on purpose.
- **Vector search**: FAISS (local), not Pinecone — no reason to add a paid cloud
  dependency for this dataset size.
- **Dataset**: public Kaggle resume dataset, not scraped/real resumes — avoids PII/
  consent issues. See README "Why a public dataset, and why anonymize".
- **Anonymization**: names/emails/phones are stripped from text *before* embedding
  (`src/talent_ai/extraction/anonymize.py`). This is a deliberate fairness measure —
  don't remove it to "simplify."
- **Automation stack** (Phase 4, not yet built): plain `watchdog` for folder
  monitoring is enough for this project's scale — don't reach for Celery/Prefect
  unless the workload genuinely needs distributed task scheduling.
- **Dashboard** (Phase 3, not yet built): Streamlit, not React — faster to build,
  sufficient for a recruiter-facing internal tool.

## Code layout

- `src/talent_ai/parsing/` — PDF -> text (PyMuPDF + OCR fallback)
- `src/talent_ai/extraction/` — NLP extraction (skills/education/experience) + anonymization
- `src/talent_ai/embeddings/` — Sentence Transformers wrapper
- `src/talent_ai/matching/` — FAISS ranker + TF-IDF baseline ranker (same interface,
  so they're interchangeable in `evaluate.py`)
- `scripts/` — CLI entry points (download data, build index, rank, evaluate)
- `tests/` — pytest unit tests for parsing/extraction/ranking

## Working conventions

- Keep `ranker.py` (FAISS) and `baseline.py` (TF-IDF) behind the same function
  signature — the evaluation harness depends on that symmetry.
- When adding a new pipeline stage, wire it into `Notebooks/01_pipeline_walkthrough.ipynb`
  too, not just the scripts — the notebook is the human-readable walkthrough.
- Don't add FastAPI/Streamlit/OpenAI SDK/Docker/Celery to `requirements.txt` until
  actually starting that phase — keep Phase 1 installable with zero API keys.
