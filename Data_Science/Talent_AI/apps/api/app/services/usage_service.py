"""Per-tenant OpenAI usage metering, built on the append-only
`usage_events` ledger (supabase/migrations/0011). One event is recorded per
real OpenAI call -- cached insight reads never call generate_insights() and
so never record usage.

The monthly token limit is keyed off `tenants.plan` (added in 0002 as a
Phase D hook) rather than its own column, so wiring up Stripe later only
ever means updating `plan` on a webhook -- this module picks the new limit
up automatically.
"""

from __future__ import annotations

from datetime import datetime, timezone

from supabase import Client

from ..deps import CurrentUser

PLAN_TOKEN_LIMITS: dict[str, int] = {
    "trial": 200_000,
    "starter": 1_000_000,
    "pro": 5_000_000,
}
DEFAULT_TOKEN_LIMIT = PLAN_TOKEN_LIMITS["trial"]


def _token_limit_for_plan(plan: str | None) -> int:
    return PLAN_TOKEN_LIMITS.get(plan or "trial", DEFAULT_TOKEN_LIMIT)


def _month_start_iso() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


def _tokens_used_this_month(*, client: Client, user: CurrentUser) -> int:
    rows = (
        client.table("usage_events")
        .select("input_tokens, output_tokens")
        .gte("created_at", _month_start_iso())
        .execute()
        .data
    )
    return sum(row["input_tokens"] + row["output_tokens"] for row in rows)


def get_usage_summary(*, client: Client, user: CurrentUser) -> dict:
    tenant_row = (
        client.table("tenants").select("plan").eq("id", user.tenant_id).single().execute().data
    )
    plan = tenant_row["plan"] if tenant_row else "trial"
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
        raise PermissionError(
            f"Monthly AI usage limit reached ({summary['tokens_used']:,} / "
            f"{summary['token_limit']:,} tokens on the {summary['plan']} plan)."
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
