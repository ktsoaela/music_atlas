from __future__ import annotations

import json

import httpx

from app.config import settings
from app.db import get_driver
from app.models.schemas import AIAskResponse
from app.services.queries import search_context


def ask(question: str, artist_id: str | None = None) -> AIAskResponse:
    sources = search_context(get_driver(), question, artist_id)
    if not settings.openai_api_key:
        return AIAskResponse(answer=_graph_answer(question, sources), sources=sources, mode="graph")

    system = (
        "You are the South African Music Atlas assistant. Answer only from the provided "
        "knowledge-graph sources. Cite artist and genre names. If sources are insufficient, say so. "
        "Be concise and historically careful."
    )
    user = f"Question: {question}\n\nSources:\n{json.dumps(sources, indent=2)}"
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{settings.openai_base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openai_model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": 0.2,
                },
            )
            resp.raise_for_status()
            answer = resp.json()["choices"][0]["message"]["content"]
            return AIAskResponse(answer=answer, sources=sources, mode="llm")
    except Exception as exc:  # ponytail: fallback keeps atlas usable without LLM
        return AIAskResponse(
            answer=f"(LLM unavailable: {exc})\n\n{_graph_answer(question, sources)}",
            sources=sources,
            mode="graph",
        )


def _graph_answer(question: str, sources: list[dict]) -> str:
    if not sources:
        return (
            "I could not find matching artists or genres in the atlas yet. "
            "Try a name like Ishmael, Prophets of Da City, Kabza, or a genre like Gqom."
        )
    lines = ["Here is what the knowledge graph contains for your question:\n"]
    for s in sources:
        if s.get("type") == "artist":
            rels = ", ".join(f"{r.get('type')} → {r.get('name')}" for r in s.get("relationships") or [])
            city = f" · {s['city']}" if s.get("city") else ""
            lines.append(
                f"- **{s['name']}** ({', '.join(s.get('genres') or []) or 'genre n/a'}){city}"
            )
            if s.get("bio"):
                lines.append(f"  {s['bio']}")
            if rels:
                lines.append(f"  Links: {rels}")
        elif s.get("type") == "genre":
            parents = ", ".join(s.get("influenced_by") or []) or "n/a"
            lines.append(
                f"- Genre **{s['name']}** originated in {s.get('origin') or 'unknown'}; influenced by {parents}."
            )
    lines.append("\nSet OPENAI_API_KEY for natural-language answers over the same sources.")
    return "\n".join(lines)
