"""Shared resume processing + index persistence.

Used by both the full-batch build_index.py script and the incremental folder
watcher (automation/watcher.py) so the two paths can't drift apart -- a resume
processed one-at-a-time by the watcher goes through exactly the same steps as one
processed in bulk by build_index.py.
"""

from __future__ import annotations

import logging
from pathlib import Path

import faiss
import numpy as np

from .config import CANDIDATES_PARQUET, FAISS_INDEX_PATH
from .embeddings.embedder import embed_texts
from .extraction.anonymize import anonymize_text
from .extraction.nlp_extractor import extract_all
from .parsing.resume_parser import extract_text
from .schemas import CandidateProfile
from .storage import load_candidates, save_candidates

logger = logging.getLogger(__name__)


def process_resume(pdf_path: Path, category: str | None, base_dir: Path) -> CandidateProfile | None:
    """Parse + extract + anonymize a single resume. Returns None (and logs) on failure
    rather than raising, so a batch loop or the watcher can skip a bad file and continue."""
    try:
        raw_text = extract_text(pdf_path)
        if not raw_text.strip():
            logger.warning("No text extracted from %s", pdf_path)
            return None

        anonymized_text = anonymize_text(raw_text)
        extracted = extract_all(raw_text)

        return CandidateProfile(
            candidate_id=pdf_path.stem,
            source_path=str(pdf_path.relative_to(base_dir)),
            category=category,
            raw_text=raw_text,
            anonymized_text=anonymized_text,
            skills=extracted["skills"],
            education=extracted["education"],
            experience=extracted["experience"],
        )
    except Exception as exc:  # malformed PDF, etc. — caller decides how to report it
        logger.warning("Failed to process %s: %s", pdf_path, exc)
        return None


def embed_profiles(profiles: list[CandidateProfile]) -> None:
    embeddings = embed_texts([p.anonymized_text for p in profiles])
    for profile, embedding in zip(profiles, embeddings):
        profile.embedding = embedding.tolist()


def persist_candidates(profiles: list[CandidateProfile]) -> None:
    save_candidates(profiles)

    embeddings = np.stack([np.asarray(p.embedding, dtype="float32") for p in profiles])
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, str(FAISS_INDEX_PATH))


def append_candidate(profile: CandidateProfile) -> list[CandidateProfile]:
    """Add one new (already-embedded) profile to the persisted index. Returns the
    full updated candidate list. Handles the "no index built yet" case so the
    watcher can process the very first resume before build_index.py has ever run."""
    existing = load_candidates() if CANDIDATES_PARQUET.exists() else []
    updated = existing + [profile]
    persist_candidates(updated)
    return updated
