from __future__ import annotations

from fastapi import APIRouter

from app.db import get_driver

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("")
def list_languages():
    with get_driver().session() as session:
        rows = session.run(
            """
            MATCH (l:Language)
            OPTIONAL MATCH (a:Artist)-[:SINGS_IN]->(l)
            OPTIONAL MATCH (l)-[:SPOKEN_IN]->(p:Place)
            OPTIONAL MATCH (c:Culture)-[:USES_LANGUAGE]->(l)
            RETURN l.id AS id, l.name AS name, l.family AS family,
                   count(DISTINCT a) AS artist_count,
                   collect(DISTINCT p.name) AS places,
                   collect(DISTINCT c.name) AS cultures
            ORDER BY l.name
            """
        )
        return [dict(r) for r in rows]


@router.get("/{language_id}")
def get_language(language_id: str):
    with get_driver().session() as session:
        row = session.run(
            """
            MATCH (l:Language {id: $id})
            OPTIONAL MATCH (l)-[:SPOKEN_IN]->(p:Place)
            OPTIONAL MATCH (c:Culture)-[:USES_LANGUAGE]->(l)
            OPTIONAL MATCH (a:Artist)-[:SINGS_IN]->(l)
            OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
            RETURN l,
                   collect(DISTINCT p.name) AS places,
                   collect(DISTINCT c.name) AS cultures,
                   collect(DISTINCT {id: a.id, name: coalesce(a.stage_name, a.name)}) AS artists,
                   collect(DISTINCT g.name) AS genres
            """,
            id=language_id,
        ).single()
        if not row:
            return {"error": "not found"}
        l = row["l"]
        return {
            "id": l["id"],
            "name": l["name"],
            "family": l.get("family"),
            "places": [p for p in row["places"] if p],
            "cultures": [c for c in row["cultures"] if c],
            "artists": [a for a in row["artists"] if a.get("id")],
            "genres": [g for g in row["genres"] if g],
        }
