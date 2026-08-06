"""Central paths and settings for the Talent_AI pipeline."""

import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(PROJECT_ROOT / ".env")

DATASET_RAW_DIR = PROJECT_ROOT / "Dataset" / "Raw"
DATASET_PROCESSED_DIR = PROJECT_ROOT / "Dataset" / "Processed"

CANDIDATES_PARQUET = DATASET_PROCESSED_DIR / "candidates.parquet"
FAISS_INDEX_PATH = DATASET_PROCESSED_DIR / "candidates.faiss"

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Phase 2: generative LLM insights (summaries, missing skills, interview questions).
# Kept separate from EMBEDDING_MODEL_NAME on purpose — see CLAUDE.md "Key decisions".
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

DATASET_RAW_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
