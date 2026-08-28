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
from app.services.candidate_service import (
    delete_candidate,
    get_resume_signed_url,
    process_and_store_resume,
)

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


def test_delete_candidate_removes_storage_object_then_db_row():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "source_path": "tenant-1/candidate-1.pdf"
    }

    with patch("app.services.candidate_service._delete_from_storage") as mock_delete_storage:
        delete_candidate(client=mock_client, user=user, candidate_id="candidate-1")

    mock_delete_storage.assert_called_once_with(token="fake-token", path="tenant-1/candidate-1.pdf")
    delete_call = mock_client.table.return_value.delete.return_value.eq.call_args
    assert delete_call.args == ("id", "candidate-1")


def test_delete_candidate_raises_when_not_found():
    user = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = None

    with patch("app.services.candidate_service._delete_from_storage") as mock_delete_storage:
        try:
            delete_candidate(client=mock_client, user=user, candidate_id="missing")
            raise AssertionError("expected ValueError for missing candidate")
        except ValueError:
            pass

    mock_delete_storage.assert_not_called()


def test_delete_from_storage_tolerates_already_gone():
    from app.services.candidate_service import _delete_from_storage

    mock_response = MagicMock(status_code=404)
    with patch("app.services.candidate_service.httpx.delete", return_value=mock_response):
        # Should not raise even though the object is already gone.
        _delete_from_storage(token="fake-token", path="tenant-1/gone.pdf")


def test_get_resume_signed_url_prefixes_relative_path():
    mock_response = MagicMock()
    mock_response.json.return_value = {"signedURL": "/object/sign/resumes/tenant-1/cand-1.pdf?token=abc"}
    with patch("app.services.candidate_service.httpx.post", return_value=mock_response):
        url = get_resume_signed_url(token="fake-token", path="tenant-1/cand-1.pdf")

    assert url.endswith("/storage/v1/object/sign/resumes/tenant-1/cand-1.pdf?token=abc")
