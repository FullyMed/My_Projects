"""Recruitment analytics -- aggregate views over a ranked candidate pool.

Separate from matching/ on purpose: matching answers "how well does this one
candidate fit," analytics answers "what does the pool as a whole look like."
"""

from __future__ import annotations

from .schemas import CandidateProfile


def skill_gap_analysis(
    candidates: list[CandidateProfile], required_skills: list[str]
) -> list[tuple[str, float]]:
    """For each required skill, the fraction of the given candidates missing it.

    Scoped to whatever candidate list is passed in -- callers pass the current
    ranked top-K shortlist, not the whole dataset, so this answers "what's my
    shortlist missing" rather than "what's missing across all historical resumes."
    Returns (skill, fraction_missing) sorted with the most commonly missing
    skill first.
    """
    if not candidates or not required_skills:
        return []

    total = len(candidates)
    gaps = [
        (skill, sum(1 for c in candidates if skill not in c.skills) / total)
        for skill in required_skills
    ]
    return sorted(gaps, key=lambda pair: pair[1], reverse=True)
