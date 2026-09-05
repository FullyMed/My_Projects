from __future__ import annotations

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request

from ..config import settings
from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.billing_service import create_billing_portal_session, create_checkout_session, handle_stripe_event

router = APIRouter()


@router.post("/checkout")
async def start_checkout(user: CurrentUser = Depends(get_current_user)) -> dict:
    client = get_scoped_client(user.token)
    try:
        url = create_checkout_session(
            client=client,
            user=user,
            success_url=f"{settings.frontend_url}/dashboard/billing?checkout=success",
            cancel_url=f"{settings.frontend_url}/dashboard/billing?checkout=cancel",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"url": url}


@router.post("/portal")
async def open_billing_portal(user: CurrentUser = Depends(get_current_user)) -> dict:
    client = get_scoped_client(user.token)
    try:
        url = create_billing_portal_session(
            client=client,
            user=user,
            return_url=f"{settings.frontend_url}/dashboard/billing",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"url": url}


@router.post("/webhook")
async def stripe_webhook(request: Request) -> dict:
    # The one deliberately unauthenticated route in this API: Stripe calls
    # this server-to-server with no Supabase session to attach a bearer
    # token to. Trust comes entirely from the signature check inside
    # handle_stripe_event -- see billing_service.py's module docstring.
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        handle_stripe_event(payload=payload, sig_header=sig_header)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"received": True}
