"""Unit tests for insight_service with a mocked Supabase client and a mocked
LLM call (no real OpenAI requests). Covers: cache hit skips the LLM, cache
miss calls the LLM and upserts a tenant-scoped row with token counts,
`refresh=True` bypasses the cache, and missing candidate/job raises.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.deps import CurrentUser
from app.services.insight_service import generate_insight, get_insight
from talent_ai_core.insights.llm_client import LLMUsage
from talent_ai_core.insights.schemas import CandidateInsights

USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")

CACHED_ROW = {
    "candidate_id": "cand-1",
    "job_description_id": "job-1",
    "insights": {"summary": "cached", "hiring_recommendation": "yes"},
    "model": "gpt-4o-mini",
    "input_tokens": 100,
    "output_tokens": 50,
    "created_at": "2026-08-31T00:00:00+00:00",
    "updated_at": "2026-08-31T00:00:00+00:00",
}


def _resp(data):
    r = MagicMock()
    r.data = data
    return r


def _cache_select(client):
    return client.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute


def _single_execute(client):
    return client.table.return_value.select.return_value.eq.return_value.single.return_value.execute


def _fake_insights():
    return (
        CandidateInsights(
            summary="Strong Python background",
            strengths=["python", "backend"],
            weaknesses=["no k8s"],
            missing_qualifications=["AWS"],
            hiring_recommendation="Proceed to interview",
            interview_questions=["Describe a hard bug you fixed"],
        ),
        LLMUsage(model="gpt-4o-mini", input_tokens=800, output_tokens=200),
    )


def test_get_insight_returns_none_when_absent():
    client = MagicMock()
    _cache_select(client).return_value = _resp([])
    assert get_insight(client=client, user=USER, candidate_id="cand-1", job_id="job-1") is None


def test_generate_insight_returns_cache_without_calling_llm():
    client = MagicMock()
    _cache_select(client).return_value = _resp([CACHED_ROW])

    with patch("app.services.insight_service.generate_insights") as gen:
        out = generate_insight(client=client, user=USER, candidate_id="cand-1", job_id="job-1")

    gen.assert_not_called()
    client.table.return_value.upsert.assert_not_called()
    assert out["insights"]["summary"] == "cached"


def test_generate_insight_calls_llm_and_upserts_tenant_scoped_row():
    client = MagicMock()
    _cache_select(client).return_value = _resp([])  # cache miss
    _single_execute(client).side_effect = [
        _resp({
            "id": "cand-1", "source_path": "t/c.pdf", "category": "ENGINEERING",
            "raw_text": "raw", "anonymized_text": "anon", "skills": ["python"],
            "education": [], "experience": [],
        }),
        _resp({
            "id": "job-1", "title": "Backend Engineer", "raw_text": "JD text",
            "required_skills": ["python", "aws"],
        }),
    ]
    saved = {**CACHED_ROW, "insights": {"summary": "Strong Python background"},
             "input_tokens": 800, "output_tokens": 200}
    client.table.return_value.upsert.return_value.execute.return_value = _resp([saved])

    with patch("app.services.insight_service.generate_insights", return_value=_fake_insights()) as gen:
        out = generate_insight(client=client, user=USER, candidate_id="cand-1", job_id="job-1")

    gen.assert_called_once()
    payload = client.table.return_value.upsert.call_args.args[0]
    assert payload["tenant_id"] == "tenant-1"
    assert payload["candidate_id"] == "cand-1"
    assert payload["job_description_id"] == "job-1"
    assert payload["input_tokens"] == 800 and payload["output_tokens"] == 200
    assert payload["insights"]["hiring_recommendation"] == "Proceed to interview"
    assert client.table.return_value.upsert.call_args.kwargs["on_conflict"] == "candidate_id,job_description_id"
    assert out["input_tokens"] == 800


def test_generate_insight_refresh_bypasses_cache():
    client = MagicMock()
    _cache_select(client).return_value = _resp([CACHED_ROW])  # cache present...
    _single_execute(client).side_effect = [
        _resp({
            "id": "cand-1", "source_path": "t/c.pdf", "category": None,
            "raw_text": "raw", "anonymized_text": "anon", "skills": [],
            "education": [], "experience": [],
        }),
        _resp({"id": "job-1", "title": "T", "raw_text": "JD", "required_skills": []}),
    ]
    client.table.return_value.upsert.return_value.execute.return_value = _resp([CACHED_ROW])

    with patch("app.services.insight_service.generate_insights", return_value=_fake_insights()) as gen:
        generate_insight(client=client, user=USER, candidate_id="cand-1", job_id="job-1", refresh=True)

    gen.assert_called_once()  # ...but refresh forced a regenerate


def test_generate_insight_raises_when_candidate_missing():
    client = MagicMock()
    _cache_select(client).return_value = _resp([])
    _single_execute(client).side_effect = [_resp(None)]

    try:
        generate_insight(client=client, user=USER, candidate_id="missing", job_id="job-1")
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
