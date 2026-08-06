"""Thin wrapper around the OpenAI client.

Isolating the actual API call here means the rest of the codebase depends on a
one-function interface (parse_structured), not OpenAI's SDK surface directly —
easier to unit-test (mock this one function) and easier to adapt if the SDK's
API shape changes.
"""

from __future__ import annotations

from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

from ..config import OPENAI_API_KEY, OPENAI_MODEL

_CLIENT: OpenAI | None = None

T = TypeVar("T", bound=BaseModel)


def get_client() -> OpenAI:
    global _CLIENT
    if _CLIENT is None:
        if not OPENAI_API_KEY:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key."
            )
        _CLIENT = OpenAI(api_key=OPENAI_API_KEY)
    return _CLIENT


def parse_structured(
    system_prompt: str,
    user_prompt: str,
    response_model: type[T],
    model: str = OPENAI_MODEL,
) -> T:
    client = get_client()
    response = client.responses.parse(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        text_format=response_model,
    )
    return response.output_parsed
