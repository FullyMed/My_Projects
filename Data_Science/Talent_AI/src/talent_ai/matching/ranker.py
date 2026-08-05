"""FAISS-backed semantic ranker.

Shares its fit()/rank() interface with matching/baseline.py's TfidfRanker on
purpose, so evaluate.py can compare the two head-to-head.
"""

from __future__ import annotations

import faiss
import numpy as np

from ..embeddings.embedder import embed_text
from ..schemas import CandidateProfile, JobDescription, MatchResult


class SemanticRanker:
    def __init__(self) -> None:
        self._index: faiss.IndexFlatIP | None = None
        self._candidate_ids: list[str] = []

    def fit(self, candidates: list[CandidateProfile]) -> None:
        embeddings = np.stack(
            [
                np.asarray(c.embedding, dtype="float32")
                if c.embedding is not None
                else embed_text(c.anonymized_text)
                for c in candidates
            ]
        )
        self._candidate_ids = [c.candidate_id for c in candidates]
        self._index = faiss.IndexFlatIP(embeddings.shape[1])
        self._index.add(embeddings)

    def rank_by_vector(self, query_vector: np.ndarray, top_k: int = 10) -> list[MatchResult]:
        """Rank against a precomputed query vector — split out from rank() so ranking
        logic can be unit-tested without needing the embedding model."""
        if self._index is None:
            raise RuntimeError("SemanticRanker.fit() must be called before rank()")

        query = np.asarray(query_vector, dtype="float32").reshape(1, -1)
        top_k = min(top_k, len(self._candidate_ids))
        scores, indices = self._index.search(query, top_k)

        return [
            MatchResult(candidate_id=self._candidate_ids[idx], score=float(score), rank=rank + 1)
            for rank, (idx, score) in enumerate(zip(indices[0], scores[0]))
        ]

    def rank(self, job: JobDescription, top_k: int = 10) -> list[MatchResult]:
        return self.rank_by_vector(embed_text(job.raw_text), top_k=top_k)
