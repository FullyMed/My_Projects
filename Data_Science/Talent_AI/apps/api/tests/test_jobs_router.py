"""Router-level test for job creation's auto-skill-extraction (Phase E parity
gap: the original Streamlit app detected required skills from the JD text
rather than making the user type them all)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np
from starlette.testclient import TestClient

from app.deps import CurrentUser, get_current_user
from app.main import app

FAKE_USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def test_create_job_merges_extracted_skills_with_typed_ones():
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    try:
        inserted = {}

        scoped = MagicMock()
        scoped.table.return_value.insert.side_effect = lambda row: (
            inserted.update(row) or MagicMock(execute=lambda: MagicMock(data=[row]))
        )
        # ensure_can_add_job: plan lookup + candidate/job count -- let both pass.
        scoped.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "plan": "pro"
        }

        with patch("app.routers.jobs.get_scoped_client", return_value=scoped), patch(
            "app.routers.jobs.embed_text", return_value=np.zeros(384, dtype="float32")
        ), patch(
            "app.routers.jobs.extract_skills", return_value=["python", "aws"]
        ):
            resp = TestClient(app).post(
                "/jobs",
                json={"title": "Backend Eng", "raw_text": "we use python and kubernetes", "required_skills": ["kubernetes"]},
            )

        assert resp.status_code == 200
        assert inserted["required_skills"] == ["aws", "kubernetes", "python"]  # union, sorted
    finally:
        app.dependency_overrides.clear()
