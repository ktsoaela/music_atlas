from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import AIAskRequest, AIAskResponse
from app.services.ai_service import ask

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/ask", response_model=AIAskResponse)
def ai_ask(body: AIAskRequest) -> AIAskResponse:
    return ask(body.question, body.artist_id)
