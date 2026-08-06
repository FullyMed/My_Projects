"""Email notifications for the automation scheduler.

Plain smtplib/email (stdlib, no extra dependency). Gracefully no-ops -- logs a
clear message and returns False -- if SMTP isn't configured in .env, rather than
crashing the scheduler. Same pattern as OPENAI_API_KEY handling in insights/llm_client.py.
"""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path

from ..config import RECRUITER_EMAIL, SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME

logger = logging.getLogger(__name__)

_REQUIRED_SETTINGS = (SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM, RECRUITER_EMAIL)


def is_configured() -> bool:
    return all(_REQUIRED_SETTINGS)


def send_report_email(report_path: Path, subject: str) -> bool:
    if not is_configured():
        logger.info("SMTP not configured, skipping email for %s", report_path.name)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM
    message["To"] = RECRUITER_EMAIL
    message.set_content(report_path.read_text(encoding="utf-8"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
    except Exception as exc:  # auth failure, network issue, etc. — don't crash the scheduler
        logger.warning("Failed to send report email: %s", exc)
        return False

    logger.info("Emailed report %s to %s", report_path.name, RECRUITER_EMAIL)
    return True
