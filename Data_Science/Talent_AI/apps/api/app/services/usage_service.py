"""Per-tenant plan limits: OpenAI usage metering (append-only `usage_events`
ledger, supabase/migrations/0011) plus candidate/job count caps for the free
trial. One event is recorded per real OpenAI call -- cached insight reads
never call generate_insights() and so never record usage.

Every limit here is keyed off `tenants.plan` (added in 0002 as a Phase D
hook) rather than its own column, so wiring up Stripe billing only ever
means updating `plan` on a webhook -- this module picks up the new limits
automatically, with no other code path needing to change.
"""

from __future__ import annotations

from datetime import datetime, timezone

from supabase import Client

from ..deps import CurrentUser
from .db_utils import fetch_one

PLAN_TOKEN_LIMITS: dict[str, int] = {
    "trial": 200_000,
    "pro": 5_000_000,
}
DEFAULT_TOKEN_LIMIT = PLAN_TOKEN_LIMITS["trial"]

# None = unlimited. Judgment-call defaults (like the token limits above) --
# easy to retune once real pricing/plans exist.
PLAN_CANDIDATE_LIMITS: dict[str, int | None] = {"trial": 10, "pro": None}
PLAN_JOB_LIMITS: dict[str, int | None] = {"trial": 3, "pro": None}


def _token_limit_for_plan(plan: str | None) -> int:
    return PLAN_TOKEN_LIMITS.get(plan or "trial", DEFAULT_TOKEN_LIMIT)


def _month_start_iso() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


def get_tenant_plan(*, client: Client, user: CurrentUser) -> str:
    tenant_row = fetch_one(client.table("tenants").select("plan").eq("id", user.tenant_id))
    return tenant_row["plan"] if tenant_row else "trial"


# Rows asked for per request when summing the ledger. PostgREST caps every
# response at the project's max-rows setting (1000 on Supabase by default), so
# one plain select silently dropped everything past that row; a Pro tenant
# making over 1000 AI calls a month was under-counted.
_LEDGER_PAGE_SIZE = 1000


def _tokens_used_this_month(*, client: Client, user: CurrentUser) -> int:
    # Page through the month's ledger. count="exact" says how many rows
    # there are, so this doesn't depend on knowing the server's max-rows cap:
    # it keeps asking from where the last page ended until it has them all.
    month_start = _month_start_iso()
    total_rows: int | None = None
    fetched = 0
    tokens = 0
    while total_rows is None or fetched < total_rows:
        response = (
            client.table("usage_events")
            .select("input_tokens, output_tokens", count="exact")
            .gte("created_at", month_start)
            .order("id")
            .range(fetched, fetched + _LEDGER_PAGE_SIZE - 1)
            .execute()
        )
        rows = response.data or []
        if total_rows is None:
            total_rows = response.count or 0
        if not rows:
            break  # rows deleted mid-count; there's nothing more to read
        tokens += sum(row["input_tokens"] + row["output_tokens"] for row in rows)
        fetched += len(rows)
    return tokens


def get_usage_summary(*, client: Client, user: CurrentUser) -> dict:
    plan = get_tenant_plan(client=client, user=user)
    limit = _token_limit_for_plan(plan)
    used = _tokens_used_this_month(client=client, user=user)

    return {
        "plan": plan,
        "tokens_used": used,
        "token_limit": limit,
        "tokens_remaining": max(0, limit - used),
        "period_start": _month_start_iso(),
    }


def ensure_within_budget(*, client: Client, user: CurrentUser) -> None:
    """Soft cap, checked before a new OpenAI call: blocks once the tenant has
    already reached its monthly limit. A single call landing slightly over
    the cap is an accepted trade-off (there's no way to know a call's token
    cost before making it) -- the next call after that is what gets blocked."""
    summary = get_usage_summary(client=client, user=user)
    if summary["tokens_used"] >= summary["token_limit"]:
        # The ledger counts from the 1st of the month (UTC), see _month_start_iso.
        next_step = (
            "Upgrade to Pro for a bigger allowance, or wait until it resets on the 1st."
            if summary["plan"] == "trial"
            else "It resets on the 1st."
        )
        raise PermissionError(
            f"You've used this month's AI allowance ({summary['tokens_used']:,} of "
            f"{summary['token_limit']:,} tokens). {next_step}"
        )


def record_usage(
    *, client: Client, user: CurrentUser, model: str, input_tokens: int, output_tokens: int
) -> None:
    client.table("usage_events").insert(
        {
            "tenant_id": user.tenant_id,
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }
    ).execute()


def _ensure_under_count_limit(
    *,
    client: Client,
    user: CurrentUser,
    table: str,
    limits: dict[str, int | None],
    noun: str,
    other_option: str = "",
) -> None:
    plan = get_tenant_plan(client=client, user=user)
    limit = limits.get(plan, limits.get("trial"))
    if limit is None:
        return
    # A HEAD request with count="exact": Postgres counts the rows and nothing
    # is sent back, so the count isn't cut off at PostgREST's max-rows cap.
    count = client.table(table).select("id", count="exact", head=True).execute().count or 0
    if count >= limit:
        raise PermissionError(
            f"The Trial plan includes up to {limit} {noun}. Upgrade to Pro to add more{other_option}."
        )


def ensure_can_add_candidate(*, client: Client, user: CurrentUser) -> None:
    _ensure_under_count_limit(
        client=client,
        user=user,
        table="candidates",
        limits=PLAN_CANDIDATE_LIMITS,
        noun="candidates",
        # Candidates can be deleted (jobs can't yet), so that's a real way out.
        other_option=", or delete a candidate you no longer need",
    )


def ensure_can_add_job(*, client: Client, user: CurrentUser) -> None:
    _ensure_under_count_limit(
        client=client, user=user, table="job_descriptions", limits=PLAN_JOB_LIMITS, noun="jobs"
    )
