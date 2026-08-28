"""Orchestrates one resume upload: parse -> anonymize -> extract -> embed
(reusing talent_ai_core as-is) -> store the PDF in Supabase Storage -> insert
one row into public.candidates. Everything here runs through the caller's
own RLS-scoped Supabase client (see app/deps.py) -- this function trusts
Postgres to enforce tenant_id correctness, not just app code.
"""

from __future__ import annotations

import tempfile
import uuid
from pathlib import Path

import httpx
from supabase import Client

from talent_ai_core.embeddings.embedder import embed_text
from talent_ai_core.extraction.anonymize import anonymize_text
from talent_ai_core.extraction.nlp_extractor import extract_all
from talent_ai_core.parsing.resume_parser import extract_text
from talent_ai_core.schemas import CandidateProfile

from ..config import settings
from ..deps import CurrentUser


def process_and_store_resume(
    *,
    client: Client,
    user: CurrentUser,
    filename: str,
    file_bytes: bytes,
    category: str | None,
) -> dict:
    candidate_id = str(uuid.uuid4())
    suffix = Path(filename).suffix or ".pdf"

    # extract_text() needs a real filesystem path (PyMuPDF/pdf2image both take
    # a path, not bytes), so the uploaded bytes are written to a temp file
    # that's cleaned up as soon as parsing finishes. delete=False + an
    # explicit close before extract_text() runs -- NOT delete=True's "with"
    # pattern -- because on Windows a second handle (fitz's own file open)
    # can't read a file that this process still holds open for writing.
    tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    try:
        tmp.write(file_bytes)
        tmp.close()
        raw_text = extract_text(Path(tmp.name))
    finally:
        Path(tmp.name).unlink(missing_ok=True)

    if not raw_text.strip():
        raise ValueError("No text could be extracted from this PDF")

    anonymized_text = anonymize_text(raw_text)
    extracted = extract_all(raw_text)
    embedding = embed_text(anonymized_text)

    storage_path = f"{user.tenant_id}/{candidate_id}{suffix}"
    _upload_to_storage(token=user.token, path=storage_path, file_bytes=file_bytes)

    profile = CandidateProfile(
        candidate_id=candidate_id,
        source_path=storage_path,
        category=category,
        raw_text=raw_text,
        anonymized_text=anonymized_text,
        skills=extracted["skills"],
        education=extracted["education"],
        experience=extracted["experience"],
        embedding=embedding.tolist(),
    )

    row = {
        "id": profile.candidate_id,
        "tenant_id": user.tenant_id,
        "source_path": profile.source_path,
        "category": profile.category,
        "raw_text": profile.raw_text,
        "anonymized_text": profile.anonymized_text,
        "skills": profile.skills,
        "education": profile.education,
        "experience": profile.experience,
        "embedding": profile.embedding,
    }
    result = client.table("candidates").insert(row).execute()
    return result.data[0]


def _upload_to_storage(*, token: str, path: str, file_bytes: bytes) -> None:
    # Plain HTTP call (rather than supabase-py's storage client) so the
    # request unambiguously carries the caller's own JWT -- Storage RLS then
    # enforces that it can only land under this tenant's folder.
    url = f"{settings.supabase_url}/storage/v1/object/resumes/{path}"
    response = httpx.post(
        url,
        content=file_bytes,
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.supabase_anon_key,
            "Content-Type": "application/pdf",
        },
        timeout=30.0,
    )
    response.raise_for_status()


def delete_candidate(*, client: Client, user: CurrentUser, candidate_id: str) -> None:
    row = (
        client.table("candidates")
        .select("source_path")
        .eq("id", candidate_id)
        .single()
        .execute()
    )
    if not row.data:
        raise ValueError("Candidate not found")

    # Storage first, then the DB row: if the Storage delete fails for any
    # reason other than "already gone," the row is left intact so the user
    # can retry, rather than leaving a DB row pointing at a deleted file or
    # silently orphaning the file. match_results rows referencing this
    # candidate cascade-delete automatically (existing FK) -- no manual
    # cleanup needed here.
    _delete_from_storage(token=user.token, path=row.data["source_path"])
    client.table("candidates").delete().eq("id", candidate_id).execute()


def _delete_from_storage(*, token: str, path: str) -> None:
    url = f"{settings.supabase_url}/storage/v1/object/resumes/{path}"
    response = httpx.delete(
        url,
        headers={"Authorization": f"Bearer {token}", "apikey": settings.supabase_anon_key},
        timeout=30.0,
    )
    # 404 means the object is already gone (e.g. a retried delete) -- treat
    # as success rather than failing the whole operation.
    if response.status_code != 404:
        response.raise_for_status()


def get_resume_signed_url(*, token: str, path: str, expires_in: int = 3600) -> str:
    url = f"{settings.supabase_url}/storage/v1/object/sign/resumes/{path}"
    response = httpx.post(
        url,
        json={"expiresIn": expires_in},
        headers={"Authorization": f"Bearer {token}", "apikey": settings.supabase_anon_key},
        timeout=30.0,
    )
    response.raise_for_status()
    # Storage's sign endpoint returns a path relative to /storage/v1, e.g.
    # {"signedURL": "/object/sign/resumes/<tenant>/<id>.pdf?token=..."}, not
    # a full URL.
    signed_path = response.json()["signedURL"]
    return f"{settings.supabase_url}/storage/v1{signed_path}"
