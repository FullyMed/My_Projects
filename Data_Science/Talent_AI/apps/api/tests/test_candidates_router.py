"""Router-level tests for the resume upload guardrails (size + magic-byte
check) added as part of a security hardening pass. These fail before the
request ever reaches candidate_service/Supabase, so no mocking of that layer
is needed -- just an auth override so the request gets past get_current_user.
"""

from __future__ import annotations

from unittest.mock import patch

from starlette.testclient import TestClient

from app.deps import CurrentUser, get_current_user
from app.main import app

FAKE_USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def _client() -> TestClient:
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    return TestClient(app)


def test_upload_rejects_file_over_size_limit():
    client = _client()
    try:
        oversized = b"%PDF-" + b"0" * (10 * 1024 * 1024 + 1)
        response = client.post(
            "/candidates/upload",
            files={"file": ("resume.pdf", oversized, "application/pdf")},
        )
        assert response.status_code == 413
    finally:
        app.dependency_overrides.clear()


def test_upload_rejects_content_that_is_not_actually_a_pdf():
    client = _client()
    try:
        # Content-Type claims PDF, but the bytes are not -- the point of the
        # magic-byte check is that the header alone is trivially spoofable.
        response = client.post(
            "/candidates/upload",
            files={"file": ("resume.pdf", b"<html>not a pdf</html>", "application/pdf")},
        )
        assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()


def test_bulk_upload_returns_per_file_results_and_keeps_going_after_a_bad_file():
    client = _client()
    try:
        with patch(
            "app.routers.candidates.process_and_store_resume",
            side_effect=lambda **kw: {"id": f"cand-for-{kw['filename']}"},
        ):
            response = client.post(
                "/candidates/upload/bulk",
                files=[
                    ("files", ("a.pdf", b"%PDF-1.4 real-ish", "application/pdf")),
                    ("files", ("b.pdf", b"not a pdf at all", "application/pdf")),
                    ("files", ("c.pdf", b"%PDF-1.4 also real-ish", "application/pdf")),
                ],
            )

        assert response.status_code == 200
        results = response.json()
        assert [r["status"] for r in results] == ["ok", "error", "ok"]
        assert results[0]["candidate_id"] == "cand-for-a.pdf"
        assert "not a valid PDF" in results[1]["detail"]
    finally:
        app.dependency_overrides.clear()


def test_bulk_upload_stops_at_the_trial_cap_but_still_reports_the_rest():
    client = _client()
    try:
        calls = {"n": 0}

        def _fake_process(**kw):
            calls["n"] += 1
            if calls["n"] > 1:
                raise PermissionError("Trial plan is limited to 10 candidates. Upgrade to add more.")
            return {"id": "cand-1"}

        with patch("app.routers.candidates.process_and_store_resume", side_effect=_fake_process):
            response = client.post(
                "/candidates/upload/bulk",
                files=[
                    ("files", ("a.pdf", b"%PDF-1.4 x", "application/pdf")),
                    ("files", ("b.pdf", b"%PDF-1.4 y", "application/pdf")),
                ],
            )

        results = response.json()
        assert results[0]["status"] == "ok"
        assert results[1]["status"] == "error" and "Trial plan" in results[1]["detail"]
    finally:
        app.dependency_overrides.clear()
