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


def _resp(data, count=None):
    r = MagicMock()
    r.data = data
    r.count = count
    return r


def _mock_client(*, plan: str, usage_rows: list[dict], server_max_rows: int = 1000):
    """A client whose ledger query behaves like PostgREST: `.range(a, b)`
    returns at most `server_max_rows` rows from `a`, and count="exact" reports
    the full total no matter how many rows came back."""
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = _resp(
        {"plan": plan}
    )

    def _range(start, end):
        page = MagicMock()
        stop = min(end + 1, start + server_max_rows)
        page.execute.return_value = _resp(usage_rows[start:stop], count=len(usage_rows))
        return page

    client.table.return_value.select.return_value.gte.return_value.order.return_value.range.side_effect = _range
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


def test_usage_sum_reads_past_the_1000_row_response_cap():
    # 2,500 calls of 100 tokens: one plain select used to stop at row 1,000
    # and report 100,000 tokens instead of 250,000.
    rows = [{"input_tokens": 60, "output_tokens": 40}] * 2500
    summary = get_usage_summary(client=_mock_client(plan="pro", usage_rows=rows), user=USER)
    assert summary["tokens_used"] == 250_000


def test_usage_sum_is_complete_even_if_the_server_cap_is_below_the_page_size():
    rows = [{"input_tokens": 1, "output_tokens": 0}] * 1234
    client = _mock_client(plan="pro", usage_rows=rows, server_max_rows=300)
    assert get_usage_summary(client=client, user=USER)["tokens_used"] == 1234


def test_budget_check_counts_every_ledger_row():
    # 1,500 rows of 200 tokens = 300,000: over the Trial limit, though the
    # first 1,000 rows alone (200,000) would only just reach it.
    rows = [{"input_tokens": 150, "output_tokens": 50}] * 1500
    client = _mock_client(plan="trial", usage_rows=rows)
    with pytest.raises(PermissionError, match="300,000"):
        ensure_within_budget(client=client, user=USER)


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
    client.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = _resp(
        {"plan": plan}
    )
    # ensure_can_add_candidate/job: a count-only select("id", count="exact",
    # head=True).execute() -- distinct chain from both the tenant-plan lookup
    # (.eq().maybe_single()) and the usage sum lookup (.gte()), so it needs
    # its own stub. A HEAD request sends back no rows, only the count.
    client.table.return_value.select.return_value.execute.return_value = _resp([], count=row_count)
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


def test_count_limit_asks_postgres_for_the_count_instead_of_fetching_rows():
    client = _mock_client_for_count(plan="trial", row_count=0)
    ensure_can_add_candidate(client=client, user=USER)
    count_call = client.table.return_value.select.call_args
    assert count_call.kwargs == {"count": "exact", "head": True}


def test_record_usage_inserts_tenant_scoped_row():
    client = MagicMock()
    record_usage(client=client, user=USER, model="gpt-4o-mini", input_tokens=123, output_tokens=45)

    payload = client.table.return_value.insert.call_args.args[0]
    assert payload["tenant_id"] == "tenant-1"
    assert payload["model"] == "gpt-4o-mini"
    assert payload["input_tokens"] == 123
    assert payload["output_tokens"] == 45
