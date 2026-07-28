from __future__ import annotations

from fastapi import APIRouter

from app.db import get_driver
from app.models.schemas import TimelineEvent
from app.services import queries

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("", response_model=list[TimelineEvent])
def get_timeline(genre: str | None = None) -> list[TimelineEvent]:
    return queries.timeline(get_driver(), genre=genre)
