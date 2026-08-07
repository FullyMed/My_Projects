"""Sentence Transformers wrapper — local, free, reproducible embeddings.

Vendored as-is from the original Talent_AI project
(src/talent_ai/embeddings/embedder.py), except EMBEDDING_MODEL_NAME is now a
local constant instead of coming from the old project's config.py (which
assumed a shared filesystem/.env setup that doesn't apply here).

Kept separate from the (Phase 2, OpenAI-based) generative LLM tasks on purpose:
this keeps the core matching pipeline runnable with zero API keys/cost.
"""

from __future__ import annotations

import numpy as np
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
"""384-dim, L2-normalized output — must match the pgvector column dimension
(supabase/migrations/0003_candidates_jobs_matches.sql: `vector(384)`)."""

_MODEL: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _MODEL
    if _MODEL is None:
        _MODEL = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _MODEL


def embed_texts(texts: list[str]) -> np.ndarray:
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.asarray(embeddings, dtype="float32")


def embed_text(text: str) -> np.ndarray:
    return embed_texts([text])[0]
