"""Router-level tests for the resume upload guardrails (size + magic-byte
check) added as part of a security hardening pass. These fail before the
request ever reaches candidate_service/Supabase, so no mocking of that layer
is needed -- just an auth override so the request gets past get_current_user.
"""

from __future__ import annotations

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
