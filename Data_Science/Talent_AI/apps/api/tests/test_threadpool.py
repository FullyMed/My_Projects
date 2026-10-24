"""Blocking work must run in FastAPI's thread pool, not on the event loop.

Every route calls blocking code (supabase-py, PyMuPDF, spaCy, the embedding
model, OpenAI, Stripe). Inside an `async def` that code runs on the event loop
and stalls every other request on the instance until it's done, so one resume
upload used to freeze the API for everyone. Plain `def` routes and
dependencies run in the thread pool instead. The tests below check both the
structure and the behavior: the work runs where no event loop is running.
"""

from __future__ import annotations

import asyncio
import inspect
from unittest.mock import patch

from fastapi.routing import APIRoute
from starlette.testclient import TestClient

from app.deps import CurrentUser, get_current_user
from app.main import app
from app.routers import billing, candidates, internal, jobs, usage

FAKE_USER = CurrentUser(user_id="user-1", tenant_id="tenant-1", token="fake-token")

# The only async route: it has to await the raw request body for Stripe's
# signature check, and hands the blocking part to run_in_threadpool itself.
ASYNC_ALLOWED = {"/billing/webhook"}


def _on_event_loop() -> bool:
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return False
    return True


def _all_routes() -> list[tuple[str, APIRoute]]:
    # Read from each router module rather than app.routes: newer FastAPI
    # keeps an included router as one nested object there, so a walk over
    # app.routes alone only finds /health.
    found = [(route.path, route) for route in app.routes if isinstance(route, APIRoute)]
    for prefix, module in [
        ("/candidates", candidates),
        ("/jobs", jobs),
        ("/usage", usage),
        ("/billing", billing),
        ("/internal", internal),
    ]:
        found += [(prefix + route.path, route) for route in module.router.routes if isinstance(route, APIRoute)]
    return found


def test_route_handlers_are_sync_so_they_run_in_the_thread_pool():
    routes = _all_routes()
    # Every route in the OpenAPI spec was checked, so this can't pass by
    # finding nothing to check.
    assert {path for path, _ in routes} == set(app.openapi()["paths"])
    async_routes = [
        path
        for path, route in routes
        if inspect.iscoroutinefunction(route.endpoint) and path not in ASYNC_ALLOWED
    ]
    assert async_routes == []


def test_auth_dependency_is_sync():
    # It calls Supabase Auth and PostgREST on every authenticated request.
    assert not inspect.iscoroutinefunction(get_current_user)


def test_resume_processing_runs_off_the_event_loop():
    seen = {}

    def _fake_process(**kw):
        seen["on_loop"] = _on_event_loop()
        return {"id": "cand-1"}

    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    try:
        with patch("app.routers.candidates.get_scoped_client"), patch(
            "app.routers.candidates.process_and_store_resume", side_effect=_fake_process
        ):
            response = TestClient(app).post(
                "/candidates/upload",
                files={"file": ("resume.pdf", b"%PDF-1.4 x", "application/pdf")},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert seen["on_loop"] is False


def test_stripe_webhook_handles_the_event_off_the_event_loop():
    seen = {}

    def _fake_handle(*, payload, sig_header):
        seen["on_loop"] = _on_event_loop()
        seen["payload"] = payload
        seen["sig_header"] = sig_header

    with patch("app.routers.billing.handle_stripe_event", side_effect=_fake_handle):
        response = TestClient(app).post(
            "/billing/webhook", content=b'{"id": "evt_1"}', headers={"stripe-signature": "t=1,v1=x"}
        )

    assert response.status_code == 200
    assert seen == {"on_loop": False, "payload": b'{"id": "evt_1"}', "sig_header": "t=1,v1=x"}
