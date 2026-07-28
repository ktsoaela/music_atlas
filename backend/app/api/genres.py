from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db import get_driver
from app.models.schemas import GenreDetail, GenreSummary
from app.services import queries

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("", response_model=list[GenreSummary])
def genres() -> list[GenreSummary]:
    return queries.list_genres(get_driver())


@router.get("/{genre_id}", response_model=GenreDetail)
def genre(genre_id: str) -> GenreDetail:
    detail = queries.get_genre(get_driver(), genre_id)
    if not detail:
        raise HTTPException(404, "Genre not found")
    return detail
