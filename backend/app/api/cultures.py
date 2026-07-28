from __future__ import annotations

from fastapi import APIRouter

from app.db import get_driver

router = APIRouter(prefix="/cultures", tags=["cultures"])


@router.get("")
def list_cultures():
    with get_driver().session() as session:
        rows = session.run(
            """
            MATCH (c:Culture)
            OPTIONAL MATCH (c)-[:USES_LANGUAGE]->(l:Language)
            OPTIONAL MATCH (g:Genre)-[:ROOTED_IN_CULTURE]->(c)
            OPTIONAL MATCH (g)<-[:PLAYS]-(a:Artist)
            RETURN c.id AS id, c.name AS name, c.description AS description,
                   collect(DISTINCT l.name) AS languages,
                   collect(DISTINCT g.name) AS genres,
                   count(DISTINCT a) AS artist_count
            ORDER BY c.name
            """
        )
        return [dict(r) for r in rows]
