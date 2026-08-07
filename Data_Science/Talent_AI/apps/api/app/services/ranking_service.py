"""Rank a tenant's candidates against one of their job descriptions, reusing
talent_ai_core's SemanticRanker as-is. The ranker itself has no notion of
tenancy -- isolation comes entirely from the fact that `client` (an RLS-scoped
Supabase client) can only ever fetch this tenant's own rows.
"""

from __future__ import annotations

from supabase import Client

from talent_ai_core.matching.ranker import SemanticRanker
from talent_ai_core.schemas import CandidateProfile, JobDescription

from .db_utils import parse_embedding
from ..deps import CurrentUser


def rank_candidates_for_job(
    *, client: Client, user: CurrentUser, job_id: str, top_k: int = 10
) -> list[dict]:
    job_row = client.table("job_descriptions").select("*").eq("id", job_id).single().execute()
    if not job_row.data:
        raise ValueError("Job description not found")

    job = JobDescription(
        title=job_row.data["title"],
        raw_text=job_row.data["raw_text"],
        required_skills=job_row.data["required_skills"] or [],
        embedding=parse_embedding(job_row.data["embedding"]),
    )

    candidate_rows = client.table("candidates").select("*").execute().data
    if not candidate_rows:
        return []

    candidates = [
        CandidateProfile(
            candidate_id=row["id"],
            source_path=row["source_path"],
            category=row.get("category"),
            raw_text=row["raw_text"],
            anonymized_text=row["anonymized_text"],
            skills=row["skills"] or [],
            education=row["education"] or [],
            experience=row["experience"] or [],
            embedding=parse_embedding(row["embedding"]),
        )
        for row in candidate_rows
    ]

    ranker = SemanticRanker()
    ranker.fit(candidates)
    results = ranker.rank(job, top_k=top_k)

    match_rows = [
        {
            "tenant_id": user.tenant_id,
            "job_description_id": job_id,
            "candidate_id": result.candidate_id,
            "score": result.score,
            "rank": result.rank,
        }
        for result in results
    ]
    client.table("match_results").insert(match_rows).execute()

    candidates_by_id = {row["id"]: row for row in candidate_rows}
    return [
        {
            "candidate_id": result.candidate_id,
            "score": result.score,
            "rank": result.rank,
            "source_path": candidates_by_id[result.candidate_id]["source_path"],
            "category": candidates_by_id[result.candidate_id]["category"],
            "skills": candidates_by_id[result.candidate_id]["skills"],
        }
        for result in results
    ]
