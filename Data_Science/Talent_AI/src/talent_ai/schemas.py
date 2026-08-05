"""Core data models shared across the pipeline."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CandidateProfile(BaseModel):
    candidate_id: str
    source_path: str
    category: str | None = None
    """Dataset-provided label (e.g. "Data Science"), used only for evaluation ground truth."""

    raw_text: str
    anonymized_text: str
    """Text used for embedding — PII stripped by extraction/anonymize.py."""

    skills: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)

    embedding: list[float] | None = None


class JobDescription(BaseModel):
    title: str
    raw_text: str
    required_skills: list[str] = Field(default_factory=list)
    embedding: list[float] | None = None


class MatchResult(BaseModel):
    candidate_id: str
    score: float
    rank: int
