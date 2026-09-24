"""Plain SMTP email sending for the weekly shortlist digest.

Vendored in spirit from the original Talent_AI project's
automation/notifier.py: stdlib smtplib + email.message, no extra dependency.
Gracefully no-ops (logs and returns False) when SMTP isn't configured,
rather than crashing the report run -- same pattern as
talent_ai_core/insights/llm_client.py's OPENAI_API_KEY handling.
"""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from ..config import settings

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(
        settings.smtp_host
        and settings.smtp_username
        and settings.smtp_password
        and settings.smtp_from
    )


def send_email(*, to: str, subject: str, body: str) -> bool:
    if not is_configured():
        logger.info("SMTP not configured, skipping email %r to %s", subject, to)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = to
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception:  # auth failure, network issue, etc. -- don't crash the report run
        logger.exception("Failed to send email %r to %s", subject, to)
        return False

    logger.info("Sent email %r to %s", subject, to)
    return True
