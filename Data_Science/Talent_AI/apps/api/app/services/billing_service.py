"""Stripe subscription billing.

`tenants.plan`/`tenants.stripe_customer_id` are only ever written from this
module, and only from `handle_stripe_event` -- never from
`create_checkout_session`, even though it runs first. That's deliberate, not
an oversight: `tenants` has no UPDATE policy for regular tenant members (only
`tenants_select_own`, a SELECT -- see supabase/migrations/0005/0007), so a
caller's own RLS-scoped client couldn't write those columns even if this
code tried to. Stripe creates the customer during Checkout if none exists
yet (`customer_email=`, no `customer=`); the webhook is what persists the
resulting id, once Stripe's signature has verified the event is genuine.

This is the only module that touches the Supabase `service_role` key
(`_admin_client`). Every other write in this codebase goes through the
caller's own JWT-scoped client -- a webhook is the one place that's
structurally different, because Stripe's call carries no Supabase user
session to scope a client with. The trust boundary here is
`stripe.Webhook.construct_event`'s HMAC signature check, not RLS -- the same
way any webhook-based integration (GitHub, etc.) has to work. Nothing in
this module reads `_admin_client()` before that signature check passes.
"""

from __future__ import annotations

import stripe
from supabase import Client, create_client

from ..config import settings
from ..deps import CurrentUser

PLAN_FOR_SUBSCRIPTION_STATUS = {
    "active": "pro",
    "trialing": "pro",
}
DEFAULT_PLAN = "trial"


def _require_configured() -> None:
    if not (settings.stripe_secret_key and settings.stripe_price_id):
        raise RuntimeError("Stripe is not configured on this service yet.")
    stripe.api_key = settings.stripe_secret_key


def _admin_client() -> Client:
    if not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not set on this service.")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def create_checkout_session(
    *, client: Client, user: CurrentUser, success_url: str, cancel_url: str
) -> str:
    _require_configured()

    tenant_row = (
        client.table("tenants")
        .select("stripe_customer_id")
        .eq("id", user.tenant_id)
        .single()
        .execute()
        .data
    )
    customer_id = (tenant_row or {}).get("stripe_customer_id")

    customer_kwargs: dict = {"customer": customer_id} if customer_id else {}
    if not customer_id:
        profile = (
            client.table("profiles").select("email").eq("id", user.user_id).single().execute().data
        )
        if profile and profile.get("email"):
            customer_kwargs["customer_email"] = profile["email"]

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        # Belt-and-suspenders tenant tagging: set on both the Checkout
        # Session and the Subscription it creates, so the webhook can find
        # the right tenant on the very first checkout, before any
        # stripe_customer_id has ever been synced back to `tenants`.
        metadata={"tenant_id": user.tenant_id},
        subscription_data={"metadata": {"tenant_id": user.tenant_id}},
        **customer_kwargs,
    )
    return session.url


def create_billing_portal_session(*, client: Client, user: CurrentUser, return_url: str) -> str:
    _require_configured()

    tenant_row = (
        client.table("tenants")
        .select("stripe_customer_id")
        .eq("id", user.tenant_id)
        .single()
        .execute()
        .data
    )
    customer_id = (tenant_row or {}).get("stripe_customer_id")
    if not customer_id:
        raise ValueError("No subscription yet -- upgrade first before managing billing.")

    session = stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)
    return session.url


def _set_tenant_plan(*, tenant_id: str, plan: str, stripe_customer_id: str | None = None) -> None:
    admin = _admin_client()
    update: dict = {"plan": plan}
    if stripe_customer_id:
        update["stripe_customer_id"] = stripe_customer_id
    admin.table("tenants").update(update).eq("id", tenant_id).execute()


def _tenant_id_for_customer(customer_id: str) -> str | None:
    admin = _admin_client()
    row = (
        admin.table("tenants")
        .select("id")
        .eq("stripe_customer_id", customer_id)
        .limit(1)
        .execute()
        .data
    )
    return row[0]["id"] if row else None


def handle_stripe_event(*, payload: bytes, sig_header: str) -> None:
    if not (settings.stripe_secret_key and settings.stripe_webhook_secret):
        raise RuntimeError("Stripe is not configured on this service yet.")
    stripe.api_key = settings.stripe_secret_key

    # Raises stripe.error.SignatureVerificationError / ValueError on a bad or
    # forged payload -- the router turns that into a 400 before we ever look
    # at the event's contents.
    event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)

    obj = event["data"]["object"]

    if event["type"] == "checkout.session.completed":
        tenant_id = (obj.get("metadata") or {}).get("tenant_id")
        if tenant_id:
            _set_tenant_plan(tenant_id=tenant_id, plan="pro", stripe_customer_id=obj.get("customer"))

    elif event["type"] == "customer.subscription.updated":
        tenant_id = (obj.get("metadata") or {}).get("tenant_id") or _tenant_id_for_customer(
            obj.get("customer")
        )
        if tenant_id:
            plan = PLAN_FOR_SUBSCRIPTION_STATUS.get(obj.get("status"), DEFAULT_PLAN)
            _set_tenant_plan(tenant_id=tenant_id, plan=plan)

    elif event["type"] == "customer.subscription.deleted":
        tenant_id = (obj.get("metadata") or {}).get("tenant_id") or _tenant_id_for_customer(
            obj.get("customer")
        )
        if tenant_id:
            _set_tenant_plan(tenant_id=tenant_id, plan=DEFAULT_PLAN)

    # Every other event type (invoice.paid, payment_method.attached, ...) is
    # ignored -- these three are the only ones plan sync depends on.
