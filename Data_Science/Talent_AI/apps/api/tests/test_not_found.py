"""Not-found handling at the HTTP layer.

supabase-py's `.single()` raises on zero rows instead of returning empty data,
which used to turn every "missing (or another tenant's) id" into an unhandled
500 -- sent without CORS headers, so the browser only saw "Failed to fetch".
These pin the corrected behavior: a real 404, and PostgREST errors always
answered as JSON from inside the CORS middleware.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from postgrest.exceptions import APIError
from starlette.testclient import TestClient

from app.deps import CurrentUser, get_current_user
from app.main import app

FAKE_USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
ORIGIN = "http://localhost:3000"


def _client_returning_no_row() -> MagicMock:
    scoped = MagicMock()
    # What .maybe_single().execute() really returns when nothing matches.
    scoped.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = None
    return scoped


def _call(method: str, path: str, scoped: MagicMock, router: str):
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    try:
        with patch(f"app.routers.{router}.get_scoped_client", return_value=scoped):
            return TestClient(app).request(method, path, headers={"Origin": ORIGIN})
    finally:
        app.dependency_overrides.clear()


def test_unknown_candidate_is_404():
    resp = _call("GET", "/candidates/missing", _client_returning_no_row(), "candidates")
    assert resp.status_code == 404


def test_unknown_candidate_resume_url_is_404():
    resp = _call("GET", "/candidates/missing/resume-url", _client_returning_no_row(), "candidates")
    assert resp.status_code == 404


def test_unknown_job_is_404():
    resp = _call("GET", "/jobs/missing", _client_returning_no_row(), "jobs")
    assert resp.status_code == 404


def test_rank_unknown_job_is_404():
    resp = _call("POST", "/jobs/missing/rank", _client_returning_no_row(), "jobs")
    assert resp.status_code == 404


def test_candidate_detail_never_returns_raw_text_or_embedding():
    scoped = _client_returning_no_row()
    _call("GET", "/candidates/cand-1", scoped, "candidates")
    columns = scoped.table.return_value.select.call_args.args[0]
    assert "raw_text" not in columns.replace("anonymized_text", "")
    assert "embedding" not in columns and "*" not in columns


def test_rank_top_k_is_bounded():
    resp = _call("POST", "/jobs/job-1/rank?top_k=100000", _client_returning_no_row(), "jobs")
    assert resp.status_code == 422


def test_non_uuid_id_is_404_with_cors_headers():
    scoped = MagicMock()
    scoped.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.side_effect = APIError(
        {"code": "22P02", "message": 'invalid input syntax for type uuid: "not-a-uuid"'}
    )
    resp = _call("GET", "/jobs/not-a-uuid", scoped, "jobs")
    assert resp.status_code == 404
    assert resp.headers.get("access-control-allow-origin") == ORIGIN


def test_other_postgrest_errors_are_json_500_with_cors_headers():
    scoped = MagicMock()
    scoped.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.side_effect = APIError(
        {"code": "57014", "message": "canceling statement due to statement timeout"}
    )
    resp = _call("GET", "/jobs/job-1", scoped, "jobs")
    assert resp.status_code == 500
    assert resp.json() == {"detail": "Database error"}
    assert resp.headers.get("access-control-allow-origin") == ORIGIN
