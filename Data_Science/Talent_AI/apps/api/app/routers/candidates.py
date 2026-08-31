from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.candidate_service import (
    delete_candidate,
    get_resume_signed_url,
    process_and_store_resume,
)
from ..services.insight_service import generate_insight, get_insight

router = APIRouter()


@router.post("/upload")
async def upload_candidate(
    file: UploadFile = File(...),
    category: str | None = Form(None),
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported")

    file_bytes = await file.read()
    client = get_scoped_client(user.token)

    try:
        candidate = process_and_store_resume(
            client=client,
            user=user,
            filename=file.filename or "resume.pdf",
            file_bytes=file_bytes,
            category=category,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return candidate


@router.get("")
async def list_candidates(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: CurrentUser = Depends(get_current_user),
) -> list[dict]:
    client = get_scoped_client(user.token)
    result = (
        client.table("candidates")
        .select("id, source_path, category, skills, education, experience, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.get("/{candidate_id}")
async def get_candidate(
    candidate_id: str, user: CurrentUser = Depends(get_current_user)
) -> dict:
    client = get_scoped_client(user.token)
    result = client.table("candidates").select("*").eq("id", candidate_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return result.data


@router.get("/{candidate_id}/resume-url")
async def get_candidate_resume_url(
    candidate_id: str, user: CurrentUser = Depends(get_current_user)
) -> dict:
    client = get_scoped_client(user.token)
    row = (
        client.table("candidates")
        .select("source_path")
        .eq("id", candidate_id)
        .single()
        .execute()
    )
    if not row.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    url = get_resume_signed_url(token=user.token, path=row.data["source_path"])
    return {"url": url, "expires_in": 3600}


@router.delete("/{candidate_id}", status_code=204)
async def remove_candidate(
    candidate_id: str, user: CurrentUser = Depends(get_current_user)
) -> None:
    client = get_scoped_client(user.token)
    try:
        delete_candidate(client=client, user=user, candidate_id=candidate_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{candidate_id}/insights")
async def read_candidate_insight(
    candidate_id: str,
    job_id: str = Query(...),
    user: CurrentUser = Depends(get_current_user),
) -> dict | None:
    client = get_scoped_client(user.token)
    return get_insight(client=client, user=user, candidate_id=candidate_id, job_id=job_id)


@router.post("/{candidate_id}/insights")
async def create_candidate_insight(
    candidate_id: str,
    job_id: str = Query(...),
    refresh: bool = Query(False),
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    client = get_scoped_client(user.token)
    try:
        return generate_insight(
            client=client,
            user=user,
            candidate_id=candidate_id,
            job_id=job_id,
            refresh=refresh,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        # OPENAI_API_KEY not configured on the service.
        raise HTTPException(status_code=503, detail=str(exc)) from exc
