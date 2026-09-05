"""AI candidate insights: one structured OpenAI call per (candidate, job),
cached in `candidate_insights`.

Tenant isolation is the database's job, as everywhere else -- `client` is an
RLS-scoped Supabase client, so the candidate/job reads and the insight
upsert can only ever touch this tenant's rows.
"""

from __future__ import annotations

from datetime import datetime, timezone

from supabase import Client

from talent_ai_core.insights.insight_generator import generate_insights
from talent_ai_core.schemas import CandidateProfile, JobDescription

from .usage_service import ensure_within_budget, record_usage
from ..deps import CurrentUser


def _row_to_response(row: dict) -> dict:
    return {
        "candidate_id": row["candidate_id"],
        "job_description_id": row["job_description_id"],
        "insights": row["insights"],
        "model": row["model"],
        "input_tokens": row["input_tokens"],
        "output_tokens": row["output_tokens"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def get_insight(
    *, client: Client, user: CurrentUser, candidate_id: str, job_id: str
) -> dict | None:
    row = (
        client.table("candidate_insights")
        .select("*")
        .eq("candidate_id", candidate_id)
        .eq("job_description_id", job_id)
        .limit(1)
        .execute()
        .data
    )
    return _row_to_response(row[0]) if row else None


def generate_insight(
    *,
    client: Client,
    user: CurrentUser,
    candidate_id: str,
    job_id: str,
    refresh: bool = False,
) -> dict:
    if not refresh:
        cached = get_insight(client=client, user=user, candidate_id=candidate_id, job_id=job_id)
        if cached is not None:
            return cached

    candidate_row = (
        client.table("candidates").select("*").eq("id", candidate_id).single().execute().data
    )
    if not candidate_row:
        raise ValueError("Candidate not found")

    job_row = (
        client.table("job_descriptions").select("*").eq("id", job_id).single().execute().data
    )
    if not job_row:
        raise ValueError("Job description not found")

    candidate = CandidateProfile(
        candidate_id=candidate_row["id"],
        source_path=candidate_row["source_path"],
        category=candidate_row.get("category"),
        raw_text=candidate_row["raw_text"],
        anonymized_text=candidate_row["anonymized_text"],
        skills=candidate_row["skills"] or [],
        education=candidate_row["education"] or [],
        experience=candidate_row["experience"] or [],
    )
    job = JobDescription(
        title=job_row["title"],
        raw_text=job_row["raw_text"],
        required_skills=job_row.get("required_skills") or [],
    )

    # Checked here, not at the router level, so a cache hit above never
    # touches the budget check -- only an actual OpenAI call costs anything.
    ensure_within_budget(client=client, user=user)
    insights, usage = generate_insights(candidate, job)
    record_usage(
        client=client,
        user=user,
        model=usage.model,
        input_tokens=usage.input_tokens,
        output_tokens=usage.output_tokens,
    )

    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "tenant_id": user.tenant_id,
        "candidate_id": candidate_id,
        "job_description_id": job_id,
        "insights": insights.model_dump(),
        "model": usage.model,
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "updated_at": now,
    }
    saved = (
        client.table("candidate_insights")
        .upsert(payload, on_conflict="candidate_id,job_description_id")
        .execute()
        .data
    )
    return _row_to_response(saved[0])
