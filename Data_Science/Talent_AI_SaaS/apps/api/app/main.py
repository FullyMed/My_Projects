from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import candidates, jobs

app = FastAPI(title="Talent AI SaaS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
