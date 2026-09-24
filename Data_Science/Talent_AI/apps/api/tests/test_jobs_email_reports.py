"""Router test for the per-job weekly-email toggle (Phase E, Part 2b)."""

from __future__ import annotations

from unittest.mock import MagicMock

from starlette.testclient import TestClient

from app.deps import CurrentUser, get_current_user
from app.main import app
from app.routers import jobs as jobs_router

FAKE_USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def test_toggle_email_reports_updates_the_job():
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    try:
        scoped = MagicMock()
        scoped.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
            {"id": "job-1", "email_reports_enabled": True}
        ]

        orig = jobs_router.get_scoped_client
        jobs_router.get_scoped_client = lambda token: scoped
        try:
            resp = TestClient(app).post("/jobs/job-1/email-reports", json={"enabled": True})
        finally:
            jobs_router.get_scoped_client = orig

        assert resp.status_code == 200
        assert resp.json()["email_reports_enabled"] is True
        scoped.table.return_value.update.assert_called_with({"email_reports_enabled": True})
    finally:
        app.dependency_overrides.clear()


def test_toggle_email_reports_404s_for_unknown_job():
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    try:
        scoped = MagicMock()
        scoped.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []

        orig = jobs_router.get_scoped_client
        jobs_router.get_scoped_client = lambda token: scoped
        try:
            resp = TestClient(app).post("/jobs/missing/email-reports", json={"enabled": True})
        finally:
            jobs_router.get_scoped_client = orig

        assert resp.status_code == 404
    finally:
        app.dependency_overrides.clear()
