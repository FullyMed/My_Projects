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

    # Replace, not accumulate: without this, re-ranking the same job appends
    # duplicate (job_id, candidate_id) rows every call, and a shrinking top_k
    # between calls would leave stale rows behind that a naive upsert
    # wouldn't remove either. This is two separate PostgREST calls, not one
    # transaction -- a crash between them briefly leaves this job with zero
    # saved matches until the next successful rank, not stale/wrong data.
    client.table("match_results").delete().eq("job_description_id", job_id).execute()
    if match_rows:
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


def get_latest_ranking(*, client: Client, user: CurrentUser, job_id: str) -> list[dict]:
    """Read back a job's already-computed ranking without recomputing it --
    used by the job detail page so revisiting a job doesn't re-run the
    embedding model on every page load."""
    job_row = client.table("job_descriptions").select("id").eq("id", job_id).single().execute()
    if not job_row.data:
        raise ValueError("Job description not found")

    match_rows = (
        client.table("match_results")
        .select("candidate_id, score, rank")
        .eq("job_description_id", job_id)
        .order("rank")
        .execute()
        .data
    )
    if not match_rows:
        return []

    candidate_ids = [row["candidate_id"] for row in match_rows]
    candidate_rows = (
        client.table("candidates")
        .select("id, source_path, category, skills")
        .in_("id", candidate_ids)
        .execute()
        .data
    )
    candidates_by_id = {row["id"]: row for row in candidate_rows}

    return [
        {
            "candidate_id": row["candidate_id"],
            "score": row["score"],
            "rank": row["rank"],
            "source_path": candidates_by_id[row["candidate_id"]]["source_path"],
            "category": candidates_by_id[row["candidate_id"]]["category"],
            "skills": candidates_by_id[row["candidate_id"]]["skills"],
        }
        for row in match_rows
    ]
