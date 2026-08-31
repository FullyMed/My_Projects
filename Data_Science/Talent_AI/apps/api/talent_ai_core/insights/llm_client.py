"""Thin wrapper around the OpenAI client.

Vendored from the original Talent_AI project
(src/talent_ai/insights/llm_client.py). Two changes for the SaaS:

1. The API key and model come from the environment directly
   (`OPENAI_API_KEY`, `OPENAI_MODEL`) instead of the old project's
   `config.py`, which assumed a single shared `.env`.
2. `parse_structured` also returns token usage, so the caller can record
   per-tenant cost in `candidate_insights` and meter it.

Isolating the actual API call here means the rest of the codebase depends on
a one-function interface, not OpenAI's SDK surface -- easy to mock in tests
(no real API calls in CI).
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

DEFAULT_MODEL = "gpt-4o-mini"

_CLIENT: OpenAI | None = None

T = TypeVar("T", bound=BaseModel)


@dataclass(frozen=True)
class LLMUsage:
    model: str
    input_tokens: int
    output_tokens: int


def get_model() -> str:
    return os.getenv("OPENAI_MODEL") or DEFAULT_MODEL


def get_client() -> OpenAI:
    global _CLIENT
    if _CLIENT is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set -- AI insights are unavailable until it is "
                "configured on the API service."
            )
        _CLIENT = OpenAI(api_key=api_key)
    return _CLIENT


def parse_structured(
    system_prompt: str,
    user_prompt: str,
    response_model: type[T],
    model: str | None = None,
) -> tuple[T, LLMUsage]:
    model = model or get_model()
    client = get_client()
    response = client.responses.parse(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        text_format=response_model,
    )
    usage = getattr(response, "usage", None)
    return response.output_parsed, LLMUsage(
        model=model,
        input_tokens=getattr(usage, "input_tokens", 0) or 0,
        output_tokens=getattr(usage, "output_tokens", 0) or 0,
    )
