# Talent_AI — Project Instructions

AI Talent Intelligence Platform: parses resumes, extracts structured candidate data,
and ranks candidates against a job description using semantic embeddings, with a
TF-IDF baseline for comparison. Full concept in the project owner's
`AI_Talent_Intelligence_Platform_Project_Proposal.pdf`. See `README.md` for setup,
usage, and the phased roadmap (Phase 1 = core pipeline, done; Phase 2 = LLM insights,
live-tested with a real OpenAI account; Phase 3 = Streamlit dashboard, done; Phase 4 =
automation + Docker, done — watcher, scheduler, and the Dockerized deployment are all
live-tested end-to-end, including in real containers).

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
- **Automation stack**: plain `watchdog` for folder monitoring + a plain
  `time.sleep` loop for scheduling (`src/talent_ai/automation/`) — don't reach for
  Celery/Prefect/APScheduler unless the workload genuinely needs distributed task
  scheduling, which it doesn't at this project's scale.
- **Automation never calls the OpenAI API.** `automation/scheduler.py` only refreshes
  the free, local `SemanticRanker` and writes Markdown reports. AI Insights stay a
  manual dashboard button. Don't wire `insight_generator.generate_insights` into the
  scheduler — that would let a timer silently rack up OpenAI cost unattended.
- **Email notifications are optional and fail silently** (`automation/notifier.py`):
  if `SMTP_HOST`/`SMTP_USERNAME`/`SMTP_PASSWORD`/`SMTP_FROM`/`RECRUITER_EMAIL` aren't
  all set in `.env`, `send_report_email` logs and returns `False` rather than
  raising — the scheduler must keep running even with zero email setup.
- **`Dataset/Incoming/` is the folder-watcher's target**, separate from the bulk
  `Dataset/Raw/` historical dataset. Processed files move to `Dataset/Raw/INCOMING/`
  (success) or `Dataset/Incoming/_failed/` (failure) — never left in `Incoming/`,
  so nothing gets reprocessed on watcher restart.
- **`build_index.py` (full batch) and `automation/watcher.py` (incremental) share**
  `src/talent_ai/indexing.py`'s `process_resume`/`embed_profiles`/`persist_candidates`
  — don't let per-resume processing logic drift between the two call sites.
- **`watcher.py` uses `watchdog.observers.polling.PollingObserver`, not the default
  native `Observer`.** Found by live Docker testing: the default relies on inotify
  events that don't reliably fire when a file is written from the Windows host side
  of a Docker-on-Windows/WSL2 bind mount (the file appears in the container's
  filesystem, but no event fires). Don't switch back to the native `Observer` to
  "reduce polling overhead" — it silently breaks the one deployment target
  (Docker) this daemon is actually meant for.
- **Docker image: install CPU-only PyTorch before `pip install -r requirements.txt`**
  (see the `Dockerfile` comment). Without this, `sentence-transformers` pulls the
  default CUDA-enabled torch build — confirmed by live testing to add ~6.5GB of
  unused GPU libraries (9.98GB image vs. 3.43GB with the fix), even though this
  container only ever does CPU inference.
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
- `src/talent_ai/indexing.py` — shared per-resume processing + index persistence,
  used by both `scripts/build_index.py` (full batch) and `automation/watcher.py`
  (incremental, one resume at a time)
- `src/talent_ai/automation/` — `watcher.py` (watchdog folder monitor),
  `scheduler.py` (periodic re-rank + Markdown report), `notifier.py` (optional SMTP email)
- `app/dashboard.py` — Streamlit recruiter dashboard, reuses all of the above
  (`storage.load_candidates`, `matching.ranker`/`baseline`, `insights.insight_generator`)
- `scripts/` — CLI entry points (download data, build index, rank, evaluate,
  generate insights, run automation daemon)
- `Dockerfile` / `docker-compose.yml` — two services (`dashboard`, `automation`)
  sharing a `./Dataset` bind mount
- `tests/` — pytest unit tests for parsing/extraction/ranking/insights/dashboard/
  indexing/notifier. Insights/dashboard/notifier tests mock the external call
  (`parse_structured` / `generate_insights` / SMTP) — no network/API key/cost/real
  email needed to run the suite. Dashboard tests use `streamlit.testing.v1.AppTest`
  against the real `Dataset/Processed/` data and are skipped automatically if
  `build_index.py` hasn't been run yet.

## Working conventions

- Keep `ranker.py` (FAISS) and `baseline.py` (TF-IDF) behind the same function
  signature — the evaluation harness depends on that symmetry.
- When adding a new pipeline stage, wire it into `Notebooks/01_pipeline_walkthrough.ipynb`
  too, not just the scripts — the notebook is the human-readable walkthrough.
- All phases (1-4) are now built. Any new feature is additive scope beyond the
  original proposal — confirm with the user before adding it rather than assuming.
