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


settings = Settings()
