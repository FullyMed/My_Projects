"""Weekly shortlist email digest -- the SaaS-shaped replacement for the
original Talent_AI project's local scheduler.py + notifier.py.

Runs with the service_role client (`admin_client.get_admin_client`), one of
two places that key is used in this codebase (see that module's docstring):
like the Stripe webhook, this path is triggered by a scheduler (see
routers/internal.py), not a browser request, so there is no user JWT to
scope an RLS client with.
Access control here is the caller-supplied token checked in the router, not
RLS -- this module only ever reads `job_descriptions` rows that opted in
(`email_reports_enabled = true`) and writes nothing.

Deliberately never imports or calls anything in talent_ai_core.insights /
OpenAI -- ranking here is semantic-only (talent_ai_core has no notion of
"free" vs "billable" calls, so keeping this module's imports OpenAI-free is
what actually enforces "automation must never silently rack up LLM cost on
a timer," the same principle the original scheduler.py stated).
"""

from __future__ import annotations

from talent_ai_core.analytics import skill_gap_analysis
from talent_ai_core.schemas import CandidateProfile

from . import email_service
from .admin_client import get_admin_client
from .db_utils import format_embedding, parse_embedding


def _build_digest(job: dict, ranked: list[dict]) -> str:
    required_skills = job.get("required_skills") or []
    lines = [
        f"Weekly shortlist: {job['title']}",
        "",
        f"Required skills: {', '.join(required_skills) or '(none detected)'}",
        "",
    ]

    shortlist = []
    for row in ranked:
        skills = row.get("skills") or []
        matched = sorted(set(skills) & set(required_skills))
        lines.append(
            f"#{row['rank']}  {row.get('category') or 'Uncategorized'}  "
            f"({row['score'] * 100:.1f}% match)  -- matched: {', '.join(matched) or '-'}"
        )
        shortlist.append(
            CandidateProfile(
                candidate_id=row["id"], source_path="", raw_text="", anonymized_text="", skills=skills
            )
        )

    if not ranked:
        lines.append("(no candidates ranked yet)")

    gaps = skill_gap_analysis(shortlist, required_skills)
    if gaps:
        lines += ["", "Skill gaps in this shortlist:"]
        lines += [f"  {skill}: {fraction * 100:.0f}% missing" for skill, fraction in gaps]

    return "\n".join(lines)


def _owner_email(admin, tenant_id: str) -> str | None:
    rows = (
        admin.table("profiles")
        .select("email, role")
        .eq("tenant_id", tenant_id)
        .execute()
        .data
    )
    if not rows:
        return None
    owner = next((r for r in rows if r.get("role") == "owner"), rows[0])
    return owner.get("email")


def _report_for_job(admin, job: dict) -> dict:
    to = _owner_email(admin, job["tenant_id"])
    if not to:
        return {"job_id": job["id"], "status": "skipped", "detail": "no recipient email on this tenant"}

    job_embedding = parse_embedding(job.get("embedding"))
    if job_embedding is None:
        return {"job_id": job["id"], "status": "skipped", "detail": "job has no embedding"}

    ranked = (
        admin.rpc(
            "match_candidates_for_tenant",
            {
                "query_embedding": format_embedding(job_embedding),
                "p_tenant_id": job["tenant_id"],
                "match_count": 10,
            },
        )
        .execute()
        .data
    ) or []
    ranked_with_rank = [{**row, "rank": i + 1} for i, row in enumerate(ranked)]

    digest = _build_digest(job, ranked_with_rank)
    sent = email_service.send_email(
        to=to, subject=f"Talent AI weekly shortlist: {job['title']}", body=digest
    )
    return {"job_id": job["id"], "status": "sent" if sent else "not_sent"}


def run_weekly_reports() -> dict:
    admin = get_admin_client()
    jobs = (
        admin.table("job_descriptions")
        .select("*")
        .eq("email_reports_enabled", True)
        .execute()
        .data
    ) or []

    results = []
    for job in jobs:
        try:
            results.append(_report_for_job(admin, job))
        except Exception as exc:  # keep going -- one bad job shouldn't sink the run
            results.append({"job_id": job["id"], "status": "error", "detail": str(exc)})

    return {"jobs_processed": len(jobs), "results": results}
