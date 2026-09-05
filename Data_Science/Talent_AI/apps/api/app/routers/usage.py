from __future__ import annotations

from fastapi import APIRouter, Depends

from ..deps import CurrentUser, get_current_user, get_scoped_client
from ..services.usage_service import get_usage_summary

router = APIRouter()


@router.get("")
async def read_usage(user: CurrentUser = Depends(get_current_user)) -> dict:
    client = get_scoped_client(user.token)
    return get_usage_summary(client=client, user=user)
