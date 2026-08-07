from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.candidate_service import process_and_store_resume

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
async def list_candidates(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    client = get_scoped_client(user.token)
    result = (
        client.table("candidates")
        .select("id, source_path, category, skills, education, experience, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
