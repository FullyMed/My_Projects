"""Unit tests for usage_service with a mocked Supabase client. Covers the
plan -> token-limit lookup, the current-month usage sum, the budget check
that gates new OpenAI calls, and that recorded usage is tenant-scoped.
"""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.deps import CurrentUser
from app.services.usage_service import (
    ensure_can_add_candidate,
    ensure_can_add_job,
    ensure_within_budget,
    get_usage_summary,
    record_usage,
)

USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def _resp(data):
    r = MagicMock()
    r.data = data
    return r


def _mock_client(*, plan: str, usage_rows: list[dict]):
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"plan": plan}
    )
    client.table.return_value.select.return_value.gte.return_value.execute.return_value = _resp(
        usage_rows
    )
    return client


def test_get_usage_summary_sums_current_month_and_uses_plan_limit():
    client = _mock_client(
        plan="trial",
        usage_rows=[{"input_tokens": 1000, "output_tokens": 500}, {"input_tokens": 200, "output_tokens": 100}],
    )

    summary = get_usage_summary(client=client, user=USER)

    assert summary["plan"] == "trial"
    assert summary["tokens_used"] == 1800
    assert summary["token_limit"] == 200_000
    assert summary["tokens_remaining"] == 200_000 - 1800


def test_get_usage_summary_unknown_plan_falls_back_to_trial_limit():
    client = _mock_client(plan="some-future-plan", usage_rows=[])
    summary = get_usage_summary(client=client, user=USER)
    assert summary["token_limit"] == 200_000


def test_ensure_within_budget_passes_when_under_limit():
    client = _mock_client(plan="trial", usage_rows=[{"input_tokens": 100, "output_tokens": 50}])
    ensure_within_budget(client=client, user=USER)  # no raise


def test_ensure_within_budget_raises_when_at_limit():
    client = _mock_client(plan="trial", usage_rows=[{"input_tokens": 200_000, "output_tokens": 0}])
    with pytest.raises(PermissionError):
        ensure_within_budget(client=client, user=USER)


def test_ensure_within_budget_uses_higher_limit_for_paid_plan():
    # Same usage that blocks a trial tenant should pass for a paid plan.
    client = _mock_client(plan="pro", usage_rows=[{"input_tokens": 200_000, "output_tokens": 0}])
    ensure_within_budget(client=client, user=USER)  # no raise


def _mock_client_for_count(*, plan: str, row_count: int):
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"plan": plan}
    )
    # ensure_can_add_candidate/job: plain select("id").execute() -- distinct
    # chain from both the tenant-plan lookup (.eq().single()) and the usage
    # sum lookup (.gte()), so it needs its own stub.
    client.table.return_value.select.return_value.execute.return_value = _resp(
        [{"id": f"row-{i}"} for i in range(row_count)]
    )
    return client


def test_ensure_can_add_candidate_passes_under_limit():
    client = _mock_client_for_count(plan="trial", row_count=9)
    ensure_can_add_candidate(client=client, user=USER)  # no raise (limit is 10)


def test_ensure_can_add_candidate_raises_at_limit():
    client = _mock_client_for_count(plan="trial", row_count=10)
    with pytest.raises(PermissionError):
        ensure_can_add_candidate(client=client, user=USER)


def test_ensure_can_add_job_raises_at_limit():
    client = _mock_client_for_count(plan="trial", row_count=3)
    with pytest.raises(PermissionError):
        ensure_can_add_job(client=client, user=USER)


def test_pro_plan_has_unlimited_candidates_and_jobs():
    client = _mock_client_for_count(plan="pro", row_count=10_000)
    ensure_can_add_candidate(client=client, user=USER)  # no raise
    ensure_can_add_job(client=client, user=USER)  # no raise


def test_record_usage_inserts_tenant_scoped_row():
    client = MagicMock()
    record_usage(client=client, user=USER, model="gpt-4o-mini", input_tokens=123, output_tokens=45)

    payload = client.table.return_value.insert.call_args.args[0]
    assert payload["tenant_id"] == "tenant-1"
    assert payload["model"] == "gpt-4o-mini"
    assert payload["input_tokens"] == 123
    assert payload["output_tokens"] == 45
