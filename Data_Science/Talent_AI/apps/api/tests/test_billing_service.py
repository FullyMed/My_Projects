"""Unit tests for billing_service. The `stripe` SDK and the admin Supabase
client are both mocked out -- no real Stripe API calls, no real service_role
client. Covers: checkout reuses vs. creates a customer, the billing portal's
"subscribe first" guard, and that each of the three webhook event types
updates the right tenant via the admin client with the right plan.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.deps import CurrentUser
from app.services import billing_service as bs

USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")


def _resp(data):
    r = MagicMock()
    r.data = data
    return r


def _configured():
    return patch.multiple(
        bs.settings,
        stripe_secret_key="sk_test_x",
        stripe_price_id="price_x",
        stripe_webhook_secret="whsec_x",
        supabase_service_role_key="service_role_x",
        supabase_url="https://example.supabase.co",
    )


def test_create_checkout_session_reuses_existing_customer():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"stripe_customer_id": "cus_existing"}
    )
    fake_session = MagicMock(url="https://checkout.stripe.com/session/abc")

    with _configured(), patch.object(bs.stripe.checkout.Session, "create", return_value=fake_session) as create:
        url = bs.create_checkout_session(
            client=client, user=USER, success_url="https://x/success", cancel_url="https://x/cancel"
        )

    assert url == fake_session.url
    kwargs = create.call_args.kwargs
    assert kwargs["customer"] == "cus_existing"
    assert "customer_email" not in kwargs
    assert kwargs["metadata"] == {"tenant_id": "tenant-1"}
    assert kwargs["subscription_data"] == {"metadata": {"tenant_id": "tenant-1"}}


def test_create_checkout_session_falls_back_to_email_when_no_customer():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = [
        _resp({"stripe_customer_id": None}),
        _resp({"email": "jane@acme.com"}),
    ]
    fake_session = MagicMock(url="https://checkout.stripe.com/session/xyz")

    with _configured(), patch.object(bs.stripe.checkout.Session, "create", return_value=fake_session) as create:
        bs.create_checkout_session(
            client=client, user=USER, success_url="https://x/success", cancel_url="https://x/cancel"
        )

    kwargs = create.call_args.kwargs
    assert "customer" not in kwargs
    assert kwargs["customer_email"] == "jane@acme.com"


def test_create_billing_portal_session_requires_existing_customer():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"stripe_customer_id": None}
    )

    with _configured():
        with pytest.raises(ValueError):
            bs.create_billing_portal_session(client=client, user=USER, return_url="https://x/return")


def test_create_billing_portal_session_succeeds_with_customer():
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = _resp(
        {"stripe_customer_id": "cus_existing"}
    )
    fake_session = MagicMock(url="https://billing.stripe.com/session/abc")

    with _configured(), patch.object(bs.stripe.billing_portal.Session, "create", return_value=fake_session):
        url = bs.create_billing_portal_session(client=client, user=USER, return_url="https://x/return")

    assert url == fake_session.url


def _fake_event(event_type: str, obj: dict):
    return {"type": event_type, "data": {"object": obj}}


def test_checkout_completed_sets_plan_pro_and_customer_id():
    admin = MagicMock()
    event = _fake_event(
        "checkout.session.completed",
        {"customer": "cus_new", "metadata": {"tenant_id": "tenant-1"}},
    )

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", return_value=event
    ):
        bs.handle_stripe_event(payload=b"{}", sig_header="sig")

    update_call = admin.table.return_value.update.call_args
    assert update_call.args[0] == {"plan": "pro", "stripe_customer_id": "cus_new"}
    admin.table.return_value.update.return_value.eq.assert_called_with("id", "tenant-1")


def test_subscription_updated_active_sets_plan_pro():
    admin = MagicMock()
    event = _fake_event(
        "customer.subscription.updated",
        {"customer": "cus_1", "status": "active", "metadata": {"tenant_id": "tenant-1"}},
    )

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", return_value=event
    ):
        bs.handle_stripe_event(payload=b"{}", sig_header="sig")

    assert admin.table.return_value.update.call_args.args[0] == {"plan": "pro"}


def test_subscription_updated_canceled_sets_plan_trial():
    admin = MagicMock()
    event = _fake_event(
        "customer.subscription.updated",
        {"customer": "cus_1", "status": "canceled", "metadata": {"tenant_id": "tenant-1"}},
    )

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", return_value=event
    ):
        bs.handle_stripe_event(payload=b"{}", sig_header="sig")

    assert admin.table.return_value.update.call_args.args[0] == {"plan": "trial"}


def test_subscription_deleted_sets_plan_trial_falling_back_to_customer_lookup():
    admin = MagicMock()
    # No metadata this time -- must fall back to looking the tenant up by
    # stripe_customer_id.
    admin.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = _resp(
        [{"id": "tenant-9"}]
    )
    event = _fake_event("customer.subscription.deleted", {"customer": "cus_9", "metadata": {}})

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", return_value=event
    ):
        bs.handle_stripe_event(payload=b"{}", sig_header="sig")

    assert admin.table.return_value.update.call_args.args[0] == {"plan": "trial"}
    admin.table.return_value.update.return_value.eq.assert_called_with("id", "tenant-9")


def test_unrecognized_event_type_is_ignored_without_error():
    admin = MagicMock()
    event = _fake_event("invoice.paid", {"customer": "cus_1"})

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", return_value=event
    ):
        bs.handle_stripe_event(payload=b"{}", sig_header="sig")  # no raise

    admin.table.return_value.update.assert_not_called()


def test_bad_signature_raises_before_touching_the_database():
    admin = MagicMock()

    with _configured(), patch.object(bs, "_admin_client", return_value=admin), patch.object(
        bs.stripe.Webhook, "construct_event", side_effect=ValueError("bad payload")
    ):
        with pytest.raises(ValueError):
            bs.handle_stripe_event(payload=b"not json", sig_header="bad-sig")

    admin.table.assert_not_called()


def test_handle_stripe_event_raises_runtime_error_when_not_configured():
    with patch.multiple(bs.settings, stripe_secret_key=None, stripe_webhook_secret=None):
        with pytest.raises(RuntimeError):
            bs.handle_stripe_event(payload=b"{}", sig_header="sig")
