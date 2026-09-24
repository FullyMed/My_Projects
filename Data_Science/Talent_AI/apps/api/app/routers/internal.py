from __future__ import annotations

import hmac

from fastapi import APIRouter, Header, HTTPException

from ..config import settings
from ..services.report_service import run_weekly_reports

router = APIRouter()


@router.post("/run-weekly-reports")
async def trigger_weekly_reports(x_report_token: str = Header(default="")) -> dict:
    # The one other deliberately unauthenticated route in this API (with
    # /billing/webhook) -- a scheduler calls this, not a signed-in browser,
    # so there's no Supabase session to require. This shared-secret header
    # is the entire access control; hmac.compare_digest avoids a timing
    # side-channel on the comparison.
    if not settings.report_trigger_secret or not hmac.compare_digest(
        x_report_token, settings.report_trigger_secret
    ):
        raise HTTPException(status_code=401, detail="Invalid or missing report token")

    return run_weekly_reports()
