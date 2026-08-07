"""Central paths and settings for the Talent_AI pipeline."""

import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(PROJECT_ROOT / ".env")

DATASET_RAW_DIR = PROJECT_ROOT / "Dataset" / "Raw"
DATASET_PROCESSED_DIR = PROJECT_ROOT / "Dataset" / "Processed"
DATASET_INCOMING_DIR = PROJECT_ROOT / "Dataset" / "Incoming"
DATASET_PUBLIC_DIR = PROJECT_ROOT / "Dataset" / "Public"
REPORTS_DIR = DATASET_PROCESSED_DIR / "Reports"

CANDIDATES_PARQUET = DATASET_PROCESSED_DIR / "candidates.parquet"
FAISS_INDEX_PATH = DATASET_PROCESSED_DIR / "candidates.faiss"

# Public deployment (e.g. Streamlit Community Cloud): PUBLIC_CANDIDATES_PARQUET
# is a PII-redacted copy committed to the repo (see public_dataset.py) -- the
# only candidate data a public deployment ever reads. PUBLIC_DEPLOYMENT gates
# app/dashboard.py's use of it, plus hiding raw text and requiring APP_PASSWORD
# to unlock AI Insights. All default to off -- local/Docker usage is unaffected.
PUBLIC_CANDIDATES_PARQUET = DATASET_PUBLIC_DIR / "candidates_public.parquet"
PUBLIC_DEPLOYMENT = os.environ.get("PUBLIC_DEPLOYMENT", "false").lower() == "true"
APP_PASSWORD = os.environ.get("APP_PASSWORD")

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Phase 2: generative LLM insights (summaries, missing skills, interview questions).
# Kept separate from EMBEDDING_MODEL_NAME on purpose — see CLAUDE.md "Key decisions".
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

# Phase 4: automation (folder watcher + scheduled re-ranking + email notifications).
SCHEDULE_INTERVAL_MINUTES = int(os.environ.get("SCHEDULE_INTERVAL_MINUTES", "30"))
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM = os.environ.get("SMTP_FROM")
RECRUITER_EMAIL = os.environ.get("RECRUITER_EMAIL")

DATASET_RAW_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
DATASET_INCOMING_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
