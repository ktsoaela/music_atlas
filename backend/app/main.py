from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, artists, cultures, genres, graph, languages, places, sources, timeline
from app.config import settings
from app.db import close_driver, get_driver
from app.services.enrich import enrich_artists
from app.services.neo4j_service import run_seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    driver = get_driver()
    # Wait briefly for bolt readiness in compose
    for _ in range(30):
        try:
            driver.verify_connectivity()
            break
        except Exception:
            import time

            time.sleep(1)
    try:
        run_seed(driver)
    except Exception as exc:
        print(f"Seed warning: {exc}")
    yield
    close_driver()


app = FastAPI(
    title="South African Music Atlas API",
    description="Knowledge graph API for SA music history (1980–2026)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(artists.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(genres.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(sources.router, prefix="/api")
app.include_router(languages.router, prefix="/api")
app.include_router(cultures.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/admin/reseed")
def reseed():
    return run_seed(get_driver())


@app.post("/api/admin/enrich")
def enrich(limit: int = 15, artist_id: str | None = None):
    """Pull Tier 1–2 structured sources (Wikidata, MusicBrainz, Wikipedia, Discogs if token)."""
    return enrich_artists(get_driver(), limit=max(1, min(limit, 40)), artist_id=artist_id)
