"""Env-based settings -- no filesystem dataset paths (unlike the old project's
config.py). Every tenant's data lives in Supabase (Postgres/Storage), not on
this service's local disk.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    supabase_url: str = os.environ["SUPABASE_URL"]
    supabase_anon_key: str = os.environ["SUPABASE_ANON_KEY"]
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # AI insights (Phase D). Optional -- the rest of the API runs fine without
    # it; the insights endpoints return 503 until it's set. Read directly from
    # os.getenv by talent_ai_core/insights/llm_client.py too; mirrored here so
    # the config surface is discoverable in one place.
    openai_api_key: str | None = os.environ.get("OPENAI_API_KEY")
    openai_model: str = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    # Stripe billing (Phase D). All optional -- the rest of the API runs fine
    # without them; the billing endpoints return 503 until they're set.
    stripe_secret_key: str | None = os.environ.get("STRIPE_SECRET_KEY")
    stripe_webhook_secret: str | None = os.environ.get("STRIPE_WEBHOOK_SECRET")
    stripe_price_id: str | None = os.environ.get("STRIPE_PRICE_ID")
    # service_role key -- deliberately narrow: used ONLY by
    # billing_service._admin_client() to apply a Stripe webhook's verified
    # plan change. Every other write in this app goes through the caller's
    # own RLS-scoped client; a webhook has no user session to scope one with,
    # so this is the one place that's structurally necessary. See
    # billing_service.py's module docstring for the full reasoning.
    supabase_service_role_key: str | None = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    # Used to build Stripe Checkout's success/cancel redirect URLs.
    frontend_url: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")


settings = Settings()
