"""Persistence for candidate profiles (Dataset/Processed/candidates.parquet).

Centralized here since build_index.py, rank_candidates.py, evaluate.py, and the
walkthrough notebook all need to save/load the same profiles.
"""

from __future__ import annotations

import pandas as pd

from .config import CANDIDATES_PARQUET
from .schemas import CandidateProfile


def save_candidates(profiles: list[CandidateProfile]) -> None:
    df = pd.DataFrame([p.model_dump() for p in profiles])
    df.to_parquet(CANDIDATES_PARQUET, index=False)


def _to_list(value, cast):
    if value is None:
        return None
    return [cast(v) for v in value]


def load_candidates() -> list[CandidateProfile]:
    if not CANDIDATES_PARQUET.exists():
        raise SystemExit(f"{CANDIDATES_PARQUET} not found. Run scripts/build_index.py first.")

    df = pd.read_parquet(CANDIDATES_PARQUET)
    profiles = []
    for record in df.to_dict(orient="records"):
        record["skills"] = _to_list(record.get("skills"), str) or []
        record["education"] = _to_list(record.get("education"), str) or []
        record["experience"] = _to_list(record.get("experience"), str) or []
        record["embedding"] = _to_list(record.get("embedding"), float)
        profiles.append(CandidateProfile(**record))
    return profiles
