from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.db import get_driver
from app.models.schemas import ArtistDetail, ArtistSummary
from app.services import queries

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("", response_model=list[ArtistSummary])
def artists(
    q: str | None = None,
    genre: str | None = None,
    generation: int | None = Query(None, ge=1, le=6),
) -> list[ArtistSummary]:
    return queries.list_artists(get_driver(), q=q, genre=genre, generation=generation)


@router.get("/hubs", response_model=list[ArtistSummary])
def hubs(limit: int = Query(12, ge=1, le=50)) -> list[ArtistSummary]:
    return queries.list_hubs(get_driver(), limit=limit)


@router.get("/{artist_id}", response_model=ArtistDetail)
def artist(artist_id: str) -> ArtistDetail:
    detail = queries.get_artist(get_driver(), artist_id)
    if not detail:
        raise HTTPException(404, "Artist not found")
    return detail
