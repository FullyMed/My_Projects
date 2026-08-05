"""TF-IDF keyword-matching baseline ranker.

Shares its fit()/rank() interface with matching/ranker.py's SemanticRanker on
purpose, so evaluate.py can compare the two head-to-head — this is what makes the
project's "semantic vs. keyword matching" claim measurable rather than aspirational.
"""

from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..schemas import CandidateProfile, JobDescription, MatchResult


class TfidfRanker:
    def __init__(self) -> None:
        self._vectorizer = TfidfVectorizer(stop_words="english")
        self._matrix = None
        self._candidate_ids: list[str] = []

    def fit(self, candidates: list[CandidateProfile]) -> None:
        self._candidate_ids = [c.candidate_id for c in candidates]
        texts = [c.anonymized_text for c in candidates]
        self._matrix = self._vectorizer.fit_transform(texts)

    def rank(self, job: JobDescription, top_k: int = 10) -> list[MatchResult]:
        if self._matrix is None:
            raise RuntimeError("TfidfRanker.fit() must be called before rank()")

        query_vec = self._vectorizer.transform([job.raw_text])
        scores = cosine_similarity(query_vec, self._matrix)[0]
        top_k = min(top_k, len(self._candidate_ids))
        top_indices = np.argsort(-scores)[:top_k]

        return [
            MatchResult(candidate_id=self._candidate_ids[idx], score=float(scores[idx]), rank=rank + 1)
            for rank, idx in enumerate(top_indices)
        ]
