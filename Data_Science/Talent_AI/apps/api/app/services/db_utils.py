"""Small helpers for round-tripping pgvector columns through PostgREST.

PostgREST has no native JSON mapping for Postgres's `vector` type, so it comes
back over the wire as its text representation ("[0.01,0.02,...]") rather than
a JSON array. Inserts go the other way fine -- PostgREST serializes a Python
list to JSON, which happens to match pgvector's literal input syntax.
"""

from __future__ import annotations


def parse_embedding(value: object) -> list[float] | None:
    if value is None:
        return None
    if isinstance(value, list):
        return [float(v) for v in value]
    if isinstance(value, str):
        stripped = value.strip("[]")
        return [float(v) for v in stripped.split(",") if v]
    raise TypeError(f"Unexpected embedding value type: {type(value)!r}")


def format_embedding(values: object) -> str:
    """pgvector's text input literal ("[0.01,0.02,...]") for a sequence of
    floats. Used when passing a query vector to the `match_candidates` RPC:
    the arg is typed `vector(384)`, and a text literal coerces to it
    unambiguously, sidestepping any JSON-array-to-vector question at the
    PostgREST boundary."""
    if values is None:
        raise TypeError("Cannot format a null embedding")
    return "[" + ",".join(str(float(v)) for v in values) + "]"
