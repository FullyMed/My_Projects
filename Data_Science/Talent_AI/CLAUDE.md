# Talent_AI — Project Instructions

AI Talent Intelligence Platform: parses resumes, extracts structured candidate data,
and ranks candidates against a job description using semantic embeddings, with a
TF-IDF baseline for comparison. Full concept in the project owner's
`AI_Talent_Intelligence_Platform_Project_Proposal.pdf`. See `README.md` for setup,
usage, and the phased roadmap (Phase 1 = core pipeline, done; Phase 2 = LLM insights,
live-tested with a real OpenAI account; Phase 3 = Streamlit dashboard, done; Phase 4 =
automation — not yet built).

## Key decisions (don't relitigate without asking)

- **Embeddings**: Sentence Transformers (local, free, reproducible) — not OpenAI
  embeddings. Keeps the core pipeline runnable with zero API cost/keys.
- **Generative LLM tasks** (Phase 2: summaries, interview questions): OpenAI API,
  via `src/talent_ai/insights/`. Kept separate from embeddings on purpose.
- **Phase 2 sends only anonymized text to OpenAI** — `insight_generator.py` uses
  `candidate.anonymized_text`, never `raw_text`. This isn't optional/cosmetic: it's
  the reason `anonymize.py` exists — don't "simplify" by passing raw_text.
- **Phase 2 is scoped to a ranked shortlist (top-K), not the whole dataset** —
  `generate_insights.py` ranks first, then only calls the LLM on the top-K results.
  Don't add a "run insights on all candidates" mode without discussing cost first.
- **One combined LLM call per candidate**, not five separate calls (summary,
  strengths/weaknesses, missing quals, recommendation, interview questions all in one
  structured `CandidateInsights` response) — cheaper and keeps the output consistent.
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
- **Dashboard**: Streamlit (`app/dashboard.py`), not React — faster to build,
  sufficient for a recruiter-facing internal tool.
- **AI Insights in the dashboard are on-demand per-candidate** (a button inside each
  candidate's expander), never auto-generated for the whole shortlist on page load
  or rerun. Streamlit reruns the entire script on every UI interaction — an
  auto-generate-on-load design would silently multiply OpenAI API calls. Don't
  "simplify" this into an automatic loop.

## Code layout

- `src/talent_ai/parsing/` — PDF -> text (PyMuPDF + OCR fallback)
- `src/talent_ai/extraction/` — NLP extraction (skills/education/experience) + anonymization
- `src/talent_ai/embeddings/` — Sentence Transformers wrapper
- `src/talent_ai/matching/` — FAISS ranker + TF-IDF baseline ranker (same interface,
  so they're interchangeable in `evaluate.py`)
- `src/talent_ai/insights/` — OpenAI wrapper (`llm_client.py`) + prompt/insight
  generation (`insight_generator.py`) + `CandidateInsights` schema
- `app/dashboard.py` — Streamlit recruiter dashboard, reuses all of the above
  (`storage.load_candidates`, `matching.ranker`/`baseline`, `insights.insight_generator`)
- `scripts/` — CLI entry points (download data, build index, rank, evaluate, generate insights)
- `tests/` — pytest unit tests for parsing/extraction/ranking/insights/dashboard.
  Insights and dashboard tests mock the LLM call (`parse_structured` /
  `generate_insights`) — no network/API key/cost needed to run the suite. Dashboard
  tests use `streamlit.testing.v1.AppTest` against the real `Dataset/Processed/`
  data and are skipped automatically if `build_index.py` hasn't been run yet.

## Working conventions

- Keep `ranker.py` (FAISS) and `baseline.py` (TF-IDF) behind the same function
  signature — the evaluation harness depends on that symmetry.
- When adding a new pipeline stage, wire it into `Notebooks/01_pipeline_walkthrough.ipynb`
  too, not just the scripts — the notebook is the human-readable walkthrough.
- Don't add Docker/Celery/watchdog to `requirements.txt` until Phase 4 actually starts.
