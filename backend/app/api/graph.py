from __future__ import annotations

from fastapi import APIRouter, Query

from app.db import get_driver
from app.models.schemas import GraphPayload
from app.services import queries

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/influence", response_model=GraphPayload)
def influence(
    artist_id: str | None = Query(None),
    depth: int = Query(2, ge=1, le=4),
) -> GraphPayload:
    return queries.influence_graph(get_driver(), artist_id=artist_id, depth=depth)
