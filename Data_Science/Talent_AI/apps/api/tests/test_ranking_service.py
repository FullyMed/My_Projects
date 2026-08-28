"""Unit tests for ranking_service with a mocked Supabase client.

What's covered: the semantic path calls the `match_candidates` RPC (not a
full-table candidate fetch) and records the result as tenant-scoped
`match_results` rows, replacing any prior ones; the TF-IDF path returns a
ranking but never writes `match_results`; skill-gap aggregates a job's saved
shortlist. Not covered: the actual nearest-neighbour math (that's Postgres /
pgvector) or TfidfRanker's math (vendored from the original project).
"""

from __future__ import annotations

from unittest.mock import MagicMock

from app.deps import CurrentUser
from app.services.ranking_service import (
    get_latest_ranking,
    rank_candidates_for_job,
    rank_candidates_tfidf,
    skill_gap_for_job,
)

USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def _resp(data):
    response = MagicMock()
    response.data = data
    return response


def test_rank_candidates_for_job_uses_rpc_and_records_tenant_scoped_matches():
    job_row = {
        "id": "job-1",
        "title": "Backend Engineer",
        "raw_text": "Looking for a Python backend engineer",
        "required_skills": ["python"],
        "embedding": "[" + ",".join(["0.1"] * 384) + "]",  # pgvector's text form
    }
    rpc_rows = [
        {
            "id": "cand-1",
            "source_path": "tenant-1/cand-1.pdf",
            "category": "ENGINEERING",
            "skills": ["python"],
            "score": 0.82,
        },
        {
            "id": "cand-2",
            "source_path": "tenant-1/cand-2.pdf",
            "category": "FINANCE",
            "skills": ["excel"],
            "score": 0.41,
        },
    ]

    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        job_row
    )
    client.rpc.return_value.execute.return_value = _resp(rpc_rows)

    results = rank_candidates_for_job(client=client, user=USER, job_id="job-1", top_k=5)

    # The stored job embedding is reused -- the RPC is called with a vector
    # literal and the requested top_k, and no full candidate table scan happens.
    rpc_name, rpc_args = client.rpc.call_args.args
    assert rpc_name == "match_candidates"
    assert rpc_args["match_count"] == 5
    assert rpc_args["query_embedding"].startswith("[") and rpc_args["query_embedding"].endswith("]")

    assert [r["candidate_id"] for r in results] == ["cand-1", "cand-2"]
    assert [r["rank"] for r in results] == [1, 2]
    assert results[0]["category"] == "ENGINEERING"

    insert_call = client.table.return_value.insert.call_args.args[0]
    assert insert_call[0]["tenant_id"] == "tenant-1"
    assert insert_call[0]["job_description_id"] == "job-1"
    assert insert_call[0]["candidate_id"] == "cand-1"

    # Re-rank must clear this job's prior matches before inserting fresh ones.
    delete_call = client.table.return_value.delete.return_value.eq.call_args
    assert delete_call.args == ("job_description_id", "job-1")


def test_rank_candidates_for_job_raises_when_job_missing():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        None
    )

    try:
        rank_candidates_for_job(client=client, user=USER, job_id="missing", top_k=5)
        raise AssertionError("expected ValueError for missing job")
    except ValueError:
        pass


def test_rank_candidates_tfidf_returns_ranking_without_persisting():
    job_row = {"id": "job-1", "raw_text": "python backend engineer", "required_skills": ["python"]}
    candidate_rows = [
        {
            "id": "cand-1",
            "source_path": "tenant-1/cand-1.pdf",
            "category": "ENGINEERING",
            "skills": ["python"],
            "anonymized_text": "senior python backend engineer flask postgres",
        },
        {
            "id": "cand-2",
            "source_path": "tenant-1/cand-2.pdf",
            "category": "FINANCE",
            "skills": ["excel"],
            "anonymized_text": "accountant excel ledgers audit tax",
        },
    ]

    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        job_row
    )
    client.table.return_value.select.return_value.execute.return_value = _resp(candidate_rows)

    results = rank_candidates_tfidf(client=client, user=USER, job_id="job-1", top_k=5)

    assert {r["candidate_id"] for r in results} == {"cand-1", "cand-2"}
    assert results[0]["candidate_id"] == "cand-1"  # keyword overlap with the JD
    assert [r["rank"] for r in results] == [1, 2]

    # Comparison view only -- the saved ranking stays semantic.
    client.table.return_value.insert.assert_not_called()
    client.table.return_value.delete.assert_not_called()
    client.rpc.assert_not_called()


def test_skill_gap_for_job_ranks_most_commonly_missing_first():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"id": "job-1", "required_skills": ["python", "aws", "docker"]}
    )
    client.table.return_value.select.return_value.eq.return_value.execute.return_value = _resp(
        [{"candidate_id": "c1"}, {"candidate_id": "c2"}]
    )
    client.table.return_value.select.return_value.in_.return_value.execute.return_value = _resp(
        [{"id": "c1", "skills": ["python"]}, {"id": "c2", "skills": ["python", "aws"]}]
    )

    gaps = skill_gap_for_job(client=client, user=USER, job_id="job-1")

    assert gaps == [
        {"skill": "docker", "missing_fraction": 1.0},
        {"skill": "aws", "missing_fraction": 0.5},
        {"skill": "python", "missing_fraction": 0.0},
    ]


def test_skill_gap_for_job_empty_when_no_required_skills():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"id": "job-1", "required_skills": []}
    )

    assert skill_gap_for_job(client=client, user=USER, job_id="job-1") == []


def test_skill_gap_for_job_empty_when_never_ranked():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"id": "job-1", "required_skills": ["python"]}
    )
    client.table.return_value.select.return_value.eq.return_value.execute.return_value = _resp([])

    assert skill_gap_for_job(client=client, user=USER, job_id="job-1") == []


def test_get_latest_ranking_returns_saved_matches_without_recomputing():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"id": "job-1"}
    )
    client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = _resp(
        [{"candidate_id": "cand-1", "score": 0.9, "rank": 1}]
    )
    client.table.return_value.select.return_value.in_.return_value.execute.return_value = _resp(
        [{"id": "cand-1", "source_path": "tenant-1/cand-1.pdf", "category": "ENGINEERING", "skills": ["python"]}]
    )

    results = get_latest_ranking(client=client, user=USER, job_id="job-1")

    assert results == [
        {
            "candidate_id": "cand-1",
            "score": 0.9,
            "rank": 1,
            "source_path": "tenant-1/cand-1.pdf",
            "category": "ENGINEERING",
            "skills": ["python"],
        }
    ]


def test_get_latest_ranking_raises_when_job_missing():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        None
    )

    try:
        get_latest_ranking(client=client, user=USER, job_id="missing")
        raise AssertionError("expected ValueError for missing job")
    except ValueError:
        pass


def test_get_latest_ranking_returns_empty_list_when_never_ranked():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"id": "job-1"}
    )
    client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = _resp(
        []
    )

    assert get_latest_ranking(client=client, user=USER, job_id="job-1") == []
