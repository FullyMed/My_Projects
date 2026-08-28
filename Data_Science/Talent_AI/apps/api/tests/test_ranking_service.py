"""Unit tests for ranking_service with a mocked Supabase client. Verifies the
tenant's candidates get correctly rehydrated from Postgres rows (including
pgvector's text-representation embeddings) and that match_results get
inserted with the caller's tenant_id -- not that SemanticRanker's math is
correct (that's covered by the original Talent_AI project's own test suite,
since matching/ranker.py is vendored in unchanged).
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np

from app.deps import CurrentUser
from app.services.ranking_service import get_latest_ranking, rank_candidates_for_job


def _mock_table_response(data):
    response = MagicMock()
    response.data = data
    return response


def test_rank_candidates_for_job_scopes_to_tenant_and_records_matches():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")

    job_row = {
        "id": "job-1",
        "title": "Backend Engineer",
        "raw_text": "Looking for a Python backend engineer",
        "required_skills": ["python"],
        "embedding": "[" + ",".join(["0.1"] * 384) + "]",  # pgvector's text form
    }
    candidate_rows = [
        {
            "id": "cand-1",
            "source_path": "tenant-1/cand-1.pdf",
            "category": "ENGINEERING",
            "raw_text": "raw",
            "anonymized_text": "anon",
            "skills": ["python"],
            "education": [],
            "experience": [],
            "embedding": [0.1] * 384,
        }
    ]

    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = (
        _mock_table_response(job_row)
    )
    mock_client.table.return_value.select.return_value.execute.return_value = (
        _mock_table_response(candidate_rows)
    )

    # SemanticRanker.rank() re-embeds job.raw_text internally (it ignores any
    # precomputed job.embedding) via talent_ai_core.matching.ranker's own
    # imported reference to embed_text -- that's the one that needs patching,
    # not ranking_service's (which never imports embed_text directly).
    with patch(
        "talent_ai_core.matching.ranker.embed_text",
        return_value=np.array([0.1] * 384, dtype="float32"),
    ):
        results = rank_candidates_for_job(client=mock_client, user=user, job_id="job-1", top_k=5)

    assert len(results) == 1
    assert results[0]["candidate_id"] == "cand-1"
    assert results[0]["category"] == "ENGINEERING"

    insert_call = mock_client.table.return_value.insert.call_args.args[0]
    assert insert_call[0]["tenant_id"] == "tenant-1"
    assert insert_call[0]["job_description_id"] == "job-1"
    assert insert_call[0]["candidate_id"] == "cand-1"

    # Re-rank must clear this job's prior matches before inserting fresh
    # ones -- otherwise repeated ranking calls accumulate duplicate rows.
    delete_call = mock_client.table.return_value.delete.return_value.eq.call_args
    assert delete_call.args == ("job_description_id", "job-1")


def test_rank_candidates_for_job_raises_when_job_missing():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = (
        _mock_table_response(None)
    )

    try:
        rank_candidates_for_job(client=mock_client, user=user, job_id="missing", top_k=5)
        raise AssertionError("expected ValueError for missing job")
    except ValueError:
        pass


def test_get_latest_ranking_returns_saved_matches_without_recomputing():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()

    # job lookup (select -> eq -> single -> execute)
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = (
        _mock_table_response({"id": "job-1"})
    )
    # match_results lookup (select -> eq -> order -> execute)
    mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = (
        _mock_table_response([{"candidate_id": "cand-1", "score": 0.9, "rank": 1}])
    )
    # candidate summary lookup (select -> in_ -> execute)
    mock_client.table.return_value.select.return_value.in_.return_value.execute.return_value = (
        _mock_table_response(
            [{"id": "cand-1", "source_path": "tenant-1/cand-1.pdf", "category": "ENGINEERING", "skills": ["python"]}]
        )
    )

    results = get_latest_ranking(client=mock_client, user=user, job_id="job-1")

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
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = (
        _mock_table_response(None)
    )

    try:
        get_latest_ranking(client=mock_client, user=user, job_id="missing")
        raise AssertionError("expected ValueError for missing job")
    except ValueError:
        pass


def test_get_latest_ranking_returns_empty_list_when_never_ranked():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = (
        _mock_table_response({"id": "job-1"})
    )
    mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = (
        _mock_table_response([])
    )

    assert get_latest_ranking(client=mock_client, user=user, job_id="job-1") == []
