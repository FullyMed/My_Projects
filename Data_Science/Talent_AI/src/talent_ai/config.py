"""Central paths and settings for the Talent_AI pipeline."""

from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(PROJECT_ROOT / ".env")

DATASET_RAW_DIR = PROJECT_ROOT / "Dataset" / "Raw"
DATASET_PROCESSED_DIR = PROJECT_ROOT / "Dataset" / "Processed"

CANDIDATES_PARQUET = DATASET_PROCESSED_DIR / "candidates.parquet"
FAISS_INDEX_PATH = DATASET_PROCESSED_DIR / "candidates.faiss"

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

DATASET_RAW_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
