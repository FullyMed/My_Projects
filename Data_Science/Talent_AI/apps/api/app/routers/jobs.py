from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from talent_ai_core.embeddings.embedder import embed_text

from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.ranking_service import (
    get_latest_ranking,
    rank_candidates_for_job,
    rank_candidates_tfidf,
    skill_gap_for_job,
)
from ..services.usage_service import ensure_can_add_job

router = APIRouter()


class JobCreateRequest(BaseModel):
    title: str
    raw_text: str
    required_skills: list[str] = Field(default_factory=list)


@router.post("")
async def create_job(
    payload: JobCreateRequest, user: CurrentUser = Depends(get_current_user)
) -> dict:
    client = get_scoped_client(user.token)
    try:
        ensure_can_add_job(client=client, user=user)
    except PermissionError as exc:
        # Trial plan's job-count cap reached.
        raise HTTPException(status_code=402, detail=str(exc)) from exc

    embedding = embed_text(payload.raw_text)

    row = {
        "tenant_id": user.tenant_id,
        "title": payload.title,
        "raw_text": payload.raw_text,
        "required_skills": payload.required_skills,
        "embedding": embedding.tolist(),
    }
    result = client.table("job_descriptions").insert(row).execute()
    return result.data[0]


@router.get("")
async def list_jobs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: CurrentUser = Depends(get_current_user),
) -> list[dict]:
    client = get_scoped_client(user.token)
    result = (
        client.table("job_descriptions")
        .select("id, title, raw_text, required_skills, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.get("/{job_id}")
async def get_job(job_id: str, user: CurrentUser = Depends(get_current_user)) -> dict:
    client = get_scoped_client(user.token)
    result = (
        client.table("job_descriptions")
        .select("id, title, raw_text, required_skills, created_at")
        .eq("id", job_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Job description not found")
    return result.data


@router.get("/{job_id}/results")
async def get_job_results(
    job_id: str, user: CurrentUser = Depends(get_current_user)
) -> list[dict]:
    client = get_scoped_client(user.token)
    try:
        return get_latest_ranking(client=client, user=user, job_id=job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{job_id}/skill-gap")
async def get_job_skill_gap(
    job_id: str, user: CurrentUser = Depends(get_current_user)
) -> list[dict]:
    client = get_scoped_client(user.token)
    try:
        return skill_gap_for_job(client=client, user=user, job_id=job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{job_id}/rank")
async def rank_job(
    job_id: str,
    top_k: int = 10,
    method: str = "semantic",
    user: CurrentUser = Depends(get_current_user),
) -> list[dict]:
    if method not in ("semantic", "tfidf"):
        raise HTTPException(status_code=400, detail="method must be 'semantic' or 'tfidf'")
    client = get_scoped_client(user.token)
    rank = rank_candidates_for_job if method == "semantic" else rank_candidates_tfidf
    try:
        return rank(client=client, user=user, job_id=job_id, top_k=top_k)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
