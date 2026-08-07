"""Auth dependency for FastAPI routes.

The critical property this module provides: every Supabase client handed to a
route carries the *caller's own* access token (never a service_role key), so
every subsequent table()/storage call goes through PostgREST/Storage under
Row-Level Security. Tenant isolation is enforced by Postgres itself, not by
app code remembering to filter by tenant_id -- a bug here can't leak another
tenant's rows, because the database refuses them regardless of what this
service asks for.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException
from supabase import Client, create_client

from .config import settings


@dataclass
class CurrentUser:
    user_id: str
    tenant_id: str
    token: str


def _anon_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_scoped_client(token: str) -> Client:
    client = _anon_client()
    client.postgrest.auth(token)
    return client


async def get_current_user(authorization: str = Header(...)) -> CurrentUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()

    try:
        auth_response = _anon_client().auth.get_user(token)
    except Exception as exc:  # expired/invalid token, network error talking to Supabase Auth
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
    if auth_response is None or auth_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = auth_response.user.id

    scoped_client = get_scoped_client(token)
    profile = (
        scoped_client.table("profiles")
        .select("tenant_id")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        # Shouldn't happen -- the handle_new_user trigger creates this row at signup.
        raise HTTPException(status_code=403, detail="No tenant profile found for this user")

    return CurrentUser(user_id=user_id, tenant_id=profile.data["tenant_id"], token=token)
