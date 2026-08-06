"""LLM-generated candidate insights (Phase 2)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CandidateInsights(BaseModel):
    summary: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_qualifications: list[str] = Field(default_factory=list)
    hiring_recommendation: str
    interview_questions: list[str] = Field(default_factory=list)
