"""Unit tests for email_service. smtplib is mocked -- no real network/email."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.services import email_service


def _configured():
    return patch.multiple(
        email_service.settings,
        smtp_host="smtp.gmail.com",
        smtp_username="me@gmail.com",
        smtp_password="app-password",
        smtp_from="me@gmail.com",
    )


def test_is_configured_false_when_unset():
    with patch.multiple(email_service.settings, smtp_host=None, smtp_username=None, smtp_password=None, smtp_from=None):
        assert email_service.is_configured() is False


def test_send_email_no_ops_when_unconfigured():
    with patch.multiple(email_service.settings, smtp_host=None, smtp_username=None, smtp_password=None, smtp_from=None):
        with patch.object(email_service.smtplib, "SMTP") as smtp:
            sent = email_service.send_email(to="a@b.com", subject="Hi", body="Body")

    assert sent is False
    smtp.assert_not_called()


def test_send_email_succeeds_when_configured():
    with _configured():
        mock_server = MagicMock()
        mock_server.__enter__.return_value = mock_server
        with patch.object(email_service.smtplib, "SMTP", return_value=mock_server) as smtp:
            sent = email_service.send_email(to="a@b.com", subject="Hi", body="Body")

    assert sent is True
    smtp.assert_called_once()
    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with("me@gmail.com", "app-password")
    mock_server.send_message.assert_called_once()


def test_send_email_returns_false_on_smtp_failure_without_raising():
    with _configured():
        with patch.object(email_service.smtplib, "SMTP", side_effect=OSError("connection refused")):
            sent = email_service.send_email(to="a@b.com", subject="Hi", body="Body")

    assert sent is False
