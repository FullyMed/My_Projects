"""Sentence Transformers wrapper — local, free, reproducible embeddings.

Kept separate from the (Phase 2, OpenAI-based) generative LLM tasks on purpose:
this keeps the core matching pipeline runnable with zero API keys/cost.
"""

from __future__ import annotations

import numpy as np
from sentence_transformers import SentenceTransformer

from ..config import EMBEDDING_MODEL_NAME

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
