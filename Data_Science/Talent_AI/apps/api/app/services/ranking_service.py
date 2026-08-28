"""Rank a tenant's candidates against one of their job descriptions.

Two rankers, both reused as-is from talent_ai_core:

- **semantic** (`rank_candidates_for_job`) is the canonical one. It runs
  entirely in Postgres via the `match_candidates` RPC
  (supabase/migrations/0009), which does an HNSW nearest-neighbour search
  over `candidates.embedding`. Neither this service nor the RPC knows about
  tenancy -- the RPC is SECURITY INVOKER, so the caller's RLS on
  `candidates` is what scopes the search to their own rows. Only this path
  writes `match_results`.
- **tfidf** (`rank_candidates_tfidf`) is a keyword-matching baseline shown
  next to the semantic ranking in the UI so the difference is visible. It
  is computed on demand and never persisted.

`skill_gap_for_job` is an aggregate view over a job's saved shortlist: for
each required skill, the fraction of ranked candidates missing it.
"""

from __future__ import annotations

from supabase import Client

from talent_ai_core.analytics import skill_gap_analysis
from talent_ai_core.embeddings.embedder import embed_text
from talent_ai_core.matching.baseline import TfidfRanker
from talent_ai_core.schemas import CandidateProfile, JobDescription

from .db_utils import format_embedding, parse_embedding
from ..deps import CurrentUser


def _require_job(client: Client, job_id: str, columns: str = "*") -> dict:
    row = client.table("job_descriptions").select(columns).eq("id", job_id).single().execute()
    if not row.data:
        raise ValueError("Job description not found")
    return row.data


def _enrich(result_row: dict, candidate: dict) -> dict:
    return {
        "candidate_id": candidate["id"],
        "score": result_row["score"],
        "rank": result_row["rank"],
        "source_path": candidate["source_path"],
        "category": candidate["category"],
        "skills": candidate["skills"],
    }


def rank_candidates_for_job(
    *, client: Client, user: CurrentUser, job_id: str, top_k: int = 10
) -> list[dict]:
    job = _require_job(client, job_id)

    # Every job created since Phase A is embedded at creation time with the
    # same embed_text() used here, so the stored vector is exactly what a
    # re-embed would produce -- reuse it and keep the model off this path.
    # The fallback only matters for a hypothetical job row with a null
    # embedding.
    job_embedding = parse_embedding(job.get("embedding"))
    if job_embedding is None:
        job_embedding = embed_text(job["raw_text"])

    rpc_rows = (
        client.rpc(
            "match_candidates",
            {"query_embedding": format_embedding(job_embedding), "match_count": top_k},
        )
        .execute()
        .data
    ) or []

    ranked = [
        {"id": row["id"], "score": float(row["score"]), "rank": index + 1}
        for index, row in enumerate(rpc_rows)
    ]

    match_rows = [
        {
            "tenant_id": user.tenant_id,
            "job_description_id": job_id,
            "candidate_id": row["id"],
            "score": row["score"],
            "rank": row["rank"],
        }
        for row in ranked
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

    by_id = {row["id"]: row for row in rpc_rows}
    return [_enrich(row, by_id[row["id"]]) for row in ranked]


def rank_candidates_tfidf(
    *, client: Client, user: CurrentUser, job_id: str, top_k: int = 10
) -> list[dict]:
    """Keyword-matching baseline. Computed on demand for the UI's
    Semantic/Keyword comparison; deliberately not written to match_results,
    so the saved ranking a job carries is always the semantic one."""
    job = _require_job(client, job_id, "id, raw_text, required_skills")

    candidate_rows = (
        client.table("candidates")
        .select("id, source_path, category, skills, anonymized_text")
        .execute()
        .data
    )
    if not candidate_rows:
        return []

    candidates = [
        CandidateProfile(
            candidate_id=row["id"],
            source_path=row["source_path"],
            category=row.get("category"),
            raw_text=row["anonymized_text"],
            anonymized_text=row["anonymized_text"],
            skills=row["skills"] or [],
        )
        for row in candidate_rows
    ]

    ranker = TfidfRanker()
    ranker.fit(candidates)
    results = ranker.rank(
        JobDescription(
            title="",
            raw_text=job["raw_text"],
            required_skills=job.get("required_skills") or [],
        ),
        top_k=top_k,
    )

    by_id = {row["id"]: row for row in candidate_rows}
    return [
        _enrich({"score": result.score, "rank": result.rank}, by_id[result.candidate_id])
        for result in results
    ]


def get_latest_ranking(*, client: Client, user: CurrentUser, job_id: str) -> list[dict]:
    """Read back a job's already-computed ranking without recomputing it --
    used by the job detail page so revisiting a job doesn't re-run the
    embedding model on every page load."""
    _require_job(client, job_id, "id")

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


def skill_gap_for_job(*, client: Client, user: CurrentUser, job_id: str) -> list[dict]:
    """For each of the job's required skills, the fraction of its saved
    ranked shortlist that lacks it -- most commonly missing first. Empty if
    the job has no required skills or has never been ranked."""
    job = _require_job(client, job_id, "id, required_skills")
    required_skills = job.get("required_skills") or []
    if not required_skills:
        return []

    match_rows = (
        client.table("match_results")
        .select("candidate_id")
        .eq("job_description_id", job_id)
        .execute()
        .data
    )
    if not match_rows:
        return []

    candidate_ids = [row["candidate_id"] for row in match_rows]
    candidate_rows = (
        client.table("candidates")
        .select("id, skills")
        .in_("id", candidate_ids)
        .execute()
        .data
    )

    shortlist = [
        CandidateProfile(
            candidate_id=row["id"],
            source_path="",
            raw_text="",
            anonymized_text="",
            skills=row["skills"] or [],
        )
        for row in candidate_rows
    ]

    return [
        {"skill": skill, "missing_fraction": fraction}
        for skill, fraction in skill_gap_analysis(shortlist, required_skills)
    ]
