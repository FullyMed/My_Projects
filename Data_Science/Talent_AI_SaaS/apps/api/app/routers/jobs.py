from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from talent_ai_core.embeddings.embedder import embed_text

from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.ranking_service import rank_candidates_for_job

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


@router.post("/{job_id}/rank")
async def rank_job(
    job_id: str, top_k: int = 10, user: CurrentUser = Depends(get_current_user)
) -> list[dict]:
    client = get_scoped_client(user.token)
    try:
        return rank_candidates_for_job(client=client, user=user, job_id=job_id, top_k=top_k)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
