"""Router-level tests for POST /internal/run-weekly-reports -- the one route
besides the Stripe webhook with no user-session auth. Access control here is
entirely the shared-secret header, so these tests exercise that directly
rather than mocking get_current_user (there's no such dependency on this
route)."""

from __future__ import annotations

from unittest.mock import patch

from starlette.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def test_missing_token_is_rejected():
    with patch.object(settings, "report_trigger_secret", "correct-secret"):
        resp = client.post("/internal/run-weekly-reports")
    assert resp.status_code == 401


def test_wrong_token_is_rejected():
    with patch.object(settings, "report_trigger_secret", "correct-secret"):
        resp = client.post(
            "/internal/run-weekly-reports", headers={"X-Report-Token": "wrong"}
        )
    assert resp.status_code == 401


def test_unconfigured_secret_always_rejects():
    with patch.object(settings, "report_trigger_secret", None):
        resp = client.post(
            "/internal/run-weekly-reports", headers={"X-Report-Token": "anything"}
        )
    assert resp.status_code == 401


def test_correct_token_runs_the_report():
    with patch.object(settings, "report_trigger_secret", "correct-secret"), patch(
        "app.routers.internal.run_weekly_reports", return_value={"jobs_processed": 0, "results": []}
    ) as run:
        resp = client.post(
            "/internal/run-weekly-reports", headers={"X-Report-Token": "correct-secret"}
        )
    assert resp.status_code == 200
    assert resp.json() == {"jobs_processed": 0, "results": []}
    run.assert_called_once()
