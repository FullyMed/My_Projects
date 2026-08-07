"""Unit tests for candidate_service, with the Supabase client and embedding
model both mocked out -- no network, no ML model load. The real end-to-end
path (real Supabase project, real PDF, real embedding) was verified manually
against the live dev deployment; these tests guard the orchestration logic
(what gets sent to Storage vs. what gets inserted into candidates) against
regressions.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np

from app.deps import CurrentUser
from app.services.candidate_service import process_and_store_resume

SAMPLE_RAW_TEXT = "Jane Doe\njane@example.com\nPython, SQL, leadership"


def test_process_and_store_resume_inserts_tenant_scoped_row():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")

    mock_client = MagicMock()
    mock_client.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "candidate-1", "tenant_id": "tenant-1"}
    ]

    with (
        patch("app.services.candidate_service.extract_text", return_value=SAMPLE_RAW_TEXT),
        patch(
            "app.services.candidate_service.anonymize_text",
            return_value="[NAME]\n[EMAIL]\nPython, SQL, leadership",
        ),
        patch(
            "app.services.candidate_service.extract_all",
            return_value={"skills": ["python", "sql"], "education": [], "experience": []},
        ),
        patch(
            "app.services.candidate_service.embed_text",
            return_value=np.zeros(384, dtype="float32"),
        ),
        patch("app.services.candidate_service._upload_to_storage") as mock_upload,
    ):
        result = process_and_store_resume(
            client=mock_client,
            user=user,
            filename="resume.pdf",
            file_bytes=b"%PDF-1.4 fake",
            category="ENGINEERING",
        )

    assert result == {"id": "candidate-1", "tenant_id": "tenant-1"}

    # Storage upload happened under this tenant's folder specifically.
    mock_upload.assert_called_once()
    assert mock_upload.call_args.kwargs["path"].startswith("tenant-1/")

    # The inserted row carries the caller's tenant_id and the anonymized (not
    # raw) text alongside it -- raw_text is still stored for display, but
    # anonymized_text is what matching/insights are meant to use downstream.
    inserted_row = mock_client.table.return_value.insert.call_args.args[0]
    assert inserted_row["tenant_id"] == "tenant-1"
    assert inserted_row["category"] == "ENGINEERING"
    assert inserted_row["skills"] == ["python", "sql"]
    assert "[NAME]" in inserted_row["anonymized_text"]


def test_process_and_store_resume_rejects_empty_pdf_text():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()

    with patch("app.services.candidate_service.extract_text", return_value="   "):
        try:
            process_and_store_resume(
                client=mock_client,
                user=user,
                filename="blank.pdf",
                file_bytes=b"%PDF-1.4 fake",
                category=None,
            )
            raise AssertionError("expected ValueError for unreadable PDF")
        except ValueError:
            pass

    mock_client.table.assert_not_called()
