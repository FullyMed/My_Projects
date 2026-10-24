from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError

from .config import settings
from .routers import billing, candidates, internal, jobs, usage

logger = logging.getLogger(__name__)

app = FastAPI(title="Talent AI SaaS API")


@app.exception_handler(APIError)
async def postgrest_error_handler(request: Request, exc: APIError) -> JSONResponse:
    # Without this, a PostgREST error escapes as an unhandled exception, which
    # Starlette answers *outside* CORSMiddleware -- so the browser sees an
    # opaque "Failed to fetch" instead of a status code. 22P02 is Postgres's
    # "invalid text representation": a path id that isn't a UUID, which from
    # the caller's side is just a resource that doesn't exist.
    if exc.code == "22P02":
        return JSONResponse(status_code=404, content={"detail": "We couldn't find that."})
    logger.error("PostgREST error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our side. Try again in a moment."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route handlers are plain `def`, not `async def`. Everything they call
# (supabase-py, PyMuPDF, spaCy, the embedding model, OpenAI, Stripe) blocks,
# and FastAPI runs a plain `def` in its thread pool. An `async def` doing that
# work would run on the event loop itself and stall every other request on
# the instance until it finished. tests/test_threadpool.py checks this.
app.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(usage.router, prefix="/usage", tags=["usage"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])
app.include_router(internal.router, prefix="/internal", tags=["internal"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
