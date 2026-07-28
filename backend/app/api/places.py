from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db import get_driver
from app.models.schemas import ArtistSummary, PlaceNode
from app.services import queries

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[PlaceNode])
def places() -> list[PlaceNode]:
    return queries.list_places(get_driver())


@router.get("/geography", response_model=list[PlaceNode])
def geography() -> list[PlaceNode]:
    return queries.geography_roots(get_driver())


@router.get("/{place_id}/children", response_model=list[PlaceNode])
def children(place_id: str) -> list[PlaceNode]:
    places = {p.id for p in queries.list_places(get_driver())}
    if place_id not in places:
        raise HTTPException(404, "Place not found")
    return queries.place_children(get_driver(), place_id)


@router.get("/{place_id}/artists", response_model=list[ArtistSummary])
def artists_for_place(place_id: str) -> list[ArtistSummary]:
    places = {p.id: p for p in queries.list_places(get_driver())}
    if place_id not in places:
        raise HTTPException(404, "Place not found")
    return queries.place_artists(get_driver(), place_id)
