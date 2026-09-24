"""The Supabase service_role client -- the ONLY way to get one in this
codebase, and it should stay that way.

Every other Supabase client in this app is scoped to the caller's own JWT
(`app/deps.py::get_scoped_client`), so Postgres RLS is the actual tenant
boundary. A service_role client bypasses RLS entirely. It exists only for
code paths that are triggered by something other than a signed-in user's
request -- there's no JWT to scope a client with because there's no user
session at all:

- `billing_service.handle_stripe_event` -- a Stripe webhook, trust is its
  HMAC signature, checked before this is ever called.
- `report_service.run_weekly_reports` -- a scheduler-triggered run, trust is
  the shared-secret header checked in routers/internal.py.

If you're reaching for this outside one of those two request-shapes, you
almost certainly want `app.deps.get_scoped_client(user.token)` instead.
"""

from __future__ import annotations

from supabase import Client, create_client

from ..config import settings


def get_admin_client() -> Client:
    if not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not set on this service.")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
