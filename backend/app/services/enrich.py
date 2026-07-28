"""Tiered source enrichment: Wikidata / MusicBrainz / Wikipedia / Discogs (+ curated).

ponytail: live fetch is best-effort keyword search by artist name; no entity-resolution UI yet.
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Any

import httpx
from neo4j import Driver

from app.config import settings

TIERS_PATH = Path(__file__).resolve().parent.parent / "data" / "source_tiers.json"
UA = "SouthernAfricanMusicAtlas/0.1 (educational; local research tool)"


def load_tier_catalog() -> dict:
    return json.loads(TIERS_PATH.read_text())


def _slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:80] or "source"


def _upsert_source(
    session,
    *,
    source_id: str,
    title: str,
    tier: int,
    provider: str,
    url: str | None,
    excerpt: str | None,
    artist_id: str,
) -> None:
    session.run(
        """
        MERGE (s:Source {id: $id})
        SET s.title = $title,
            s.tier = $tier,
            s.provider = $provider,
            s.url = $url,
            s.excerpt = $excerpt,
            s.fetched_at = datetime()
        WITH s
        MATCH (a:Artist {id: $artist_id})
        MERGE (a)-[:CITED_IN]->(s)
        """,
        id=source_id,
        title=title,
        tier=tier,
        provider=provider,
        url=url,
        excerpt=(excerpt or "")[:1200] or None,
        artist_id=artist_id,
    )


def _musicbrainz(client: httpx.Client, name: str) -> dict[str, Any] | None:
    r = client.get(
        "https://musicbrainz.org/ws/2/artist",
        params={"query": f'artist:"{name}"', "fmt": "json", "limit": 1},
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    if r.status_code != 200:
        return None
    artists = r.json().get("artists") or []
    if not artists:
        return None
    a = artists[0]
    return {
        "mbid": a.get("id"),
        "name": a.get("name"),
        "type": a.get("type"),
        "country": a.get("country"),
        "disambiguation": a.get("disambiguation"),
        "url": f"https://musicbrainz.org/artist/{a['id']}" if a.get("id") else None,
        "score": a.get("score"),
    }


def _wikidata(client: httpx.Client, name: str) -> dict[str, Any] | None:
    r = client.get(
        "https://www.wikidata.org/w/api.php",
        params={
            "action": "wbsearchentities",
            "search": name,
            "language": "en",
            "format": "json",
            "limit": 1,
            "type": "item",
        },
        headers={"User-Agent": UA},
    )
    if r.status_code != 200:
        return None
    hits = r.json().get("search") or []
    if not hits:
        return None
    h = hits[0]
    qid = h.get("id")
    return {
        "qid": qid,
        "label": h.get("label"),
        "description": h.get("description"),
        "url": f"https://www.wikidata.org/wiki/{qid}" if qid else None,
    }


def _wikipedia(client: httpx.Client, name: str) -> dict[str, Any] | None:
    # Try exact title, then search
    title = name.replace(" ", "_")
    r = client.get(
        f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}",
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    if r.status_code == 404:
        s = client.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "opensearch",
                "search": name,
                "limit": 1,
                "namespace": 0,
                "format": "json",
            },
            headers={"User-Agent": UA},
        )
        if s.status_code == 200:
            data = s.json()
            if len(data) > 1 and data[1]:
                title = data[1][0].replace(" ", "_")
                r = client.get(
                    f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}",
                    headers={"User-Agent": UA, "Accept": "application/json"},
                )
    if r.status_code != 200:
        return None
    data = r.json()
    if data.get("type") == "disambiguation":
        return None
    return {
        "title": data.get("title"),
        "extract": data.get("extract"),
        "url": (data.get("content_urls") or {}).get("desktop", {}).get("page"),
        "description": data.get("description"),
    }


def _discogs(client: httpx.Client, name: str) -> dict[str, Any] | None:
    if not settings.discogs_token:
        return None
    r = client.get(
        "https://api.discogs.com/database/search",
        params={"q": name, "type": "artist", "per_page": 1},
        headers={
            "User-Agent": UA,
            "Authorization": f"Discogs token={settings.discogs_token}",
        },
    )
    if r.status_code != 200:
        return None
    results = r.json().get("results") or []
    if not results:
        return None
    hit = results[0]
    return {
        "id": hit.get("id"),
        "title": hit.get("title"),
        "url": f"https://www.discogs.com{hit['uri']}" if hit.get("uri") else None,
        "thumb": hit.get("thumb"),
    }


def enrich_artist(driver: Driver, artist_id: str) -> dict[str, Any]:
    with driver.session() as session:
        row = session.run(
            "MATCH (a:Artist {id: $id}) RETURN a.id AS id, a.name AS name, a.stage_name AS stage",
            id=artist_id,
        ).single()
        if not row:
            return {"ok": False, "error": "artist not found"}
        name = row["stage"] or row["name"]
        legal = row["name"]
        found: list[str] = []

        with httpx.Client(timeout=30.0) as client:
            mb = _musicbrainz(client, legal) or _musicbrainz(client, name)
            time.sleep(1.1)  # MusicBrainz polite rate limit
            wd = _wikidata(client, legal) or _wikidata(client, name)
            time.sleep(0.3)
            wp = _wikipedia(client, legal) or _wikipedia(client, name)
            time.sleep(0.3)
            dg = _discogs(client, legal) or _discogs(client, name)

        if mb and mb.get("mbid"):
            session.run(
                "MATCH (a:Artist {id: $id}) SET a.mbid = $mbid, a.musicbrainz_url = $url",
                id=artist_id,
                mbid=mb["mbid"],
                url=mb.get("url"),
            )
            _upsert_source(
                session,
                source_id=f"src-mb-{mb['mbid']}",
                title=f"MusicBrainz: {mb.get('name') or name}",
                tier=1,
                provider="musicbrainz",
                url=mb.get("url"),
                excerpt=f"type={mb.get('type')}; country={mb.get('country')}; {mb.get('disambiguation') or ''}".strip(),
                artist_id=artist_id,
            )
            found.append("musicbrainz")

        if wd and wd.get("qid"):
            session.run(
                "MATCH (a:Artist {id: $id}) SET a.wikidata_id = $qid, a.wikidata_url = $url",
                id=artist_id,
                qid=wd["qid"],
                url=wd.get("url"),
            )
            _upsert_source(
                session,
                source_id=f"src-wd-{wd['qid']}",
                title=f"Wikidata: {wd.get('label') or name}",
                tier=1,
                provider="wikidata",
                url=wd.get("url"),
                excerpt=wd.get("description"),
                artist_id=artist_id,
            )
            found.append("wikidata")

        if dg and dg.get("id"):
            session.run(
                "MATCH (a:Artist {id: $id}) SET a.discogs_id = $did, a.discogs_url = $url",
                id=artist_id,
                did=str(dg["id"]),
                url=dg.get("url"),
            )
            _upsert_source(
                session,
                source_id=f"src-discogs-{dg['id']}",
                title=f"Discogs: {dg.get('title') or name}",
                tier=1,
                provider="discogs",
                url=dg.get("url"),
                excerpt="Release credits & discography (Discogs search hit).",
                artist_id=artist_id,
            )
            found.append("discogs")

        if wp and wp.get("url"):
            session.run(
                "MATCH (a:Artist {id: $id}) SET a.wikipedia_url = $url",
                id=artist_id,
                url=wp.get("url"),
            )
            _upsert_source(
                session,
                source_id=f"src-wiki-{_slug(wp.get('title') or name)}",
                title=f"Wikipedia: {wp.get('title') or name}",
                tier=2,
                provider="wikipedia",
                url=wp.get("url"),
                excerpt=wp.get("extract") or wp.get("description"),
                artist_id=artist_id,
            )
            found.append("wikipedia")

        return {"ok": True, "artist_id": artist_id, "name": name, "providers": found}


def enrich_artists(driver: Driver, limit: int = 20, artist_id: str | None = None) -> dict:
    if artist_id:
        return {"results": [enrich_artist(driver, artist_id)]}
    with driver.session() as session:
        rows = session.run(
            """
            MATCH (a:Artist)
            WHERE a.mbid IS NULL AND a.wikidata_id IS NULL
            RETURN a.id AS id
            ORDER BY coalesce(a.generation, 99), a.name
            LIMIT $limit
            """,
            limit=limit,
        )
        ids = [r["id"] for r in rows]
    results = []
    for aid in ids:
        results.append(enrich_artist(driver, aid))
    return {"count": len(results), "results": results}


def seed_source_providers(driver: Driver) -> int:
    catalog = load_tier_catalog()
    n = 0
    with driver.session() as session:
        session.run(
            "CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE"
        )
        for tier in catalog["tiers"]:
            for p in tier["providers"]:
                session.run(
                    """
                    MERGE (sp:SourceProvider {id: $id})
                    SET sp.name = $name,
                        sp.tier = $tier,
                        sp.kind = $kind,
                        sp.auto = $auto,
                        sp.tier_label = $tier_label,
                        sp.tier_description = $tier_description
                    """,
                    id=p["id"],
                    name=p["name"],
                    tier=tier["tier"],
                    kind=p["kind"],
                    auto=p["auto"],
                    tier_label=tier["label"],
                    tier_description=tier["description"],
                )
                n += 1
    return n


def list_sources_for_artist(driver: Driver, artist_id: str) -> list[dict]:
    with driver.session() as session:
        rows = session.run(
            """
            MATCH (a:Artist {id: $id})-[:CITED_IN]->(s:Source)
            RETURN s.id AS id, s.title AS title, s.tier AS tier, s.provider AS provider,
                   s.url AS url, s.excerpt AS excerpt
            ORDER BY s.tier, s.provider, s.title
            """,
            id=artist_id,
        )
        return [dict(r) for r in rows]


def list_all_providers(driver: Driver) -> list[dict]:
    with driver.session() as session:
        rows = session.run(
            """
            MATCH (sp:SourceProvider)
            OPTIONAL MATCH (:Artist)-[:CITED_IN]->(s:Source {provider: sp.id})
            RETURN sp.id AS id, sp.name AS name, sp.tier AS tier, sp.kind AS kind,
                   sp.auto AS auto, sp.tier_label AS tier_label,
                   sp.tier_description AS tier_description,
                   count(DISTINCT s) AS source_count
            ORDER BY sp.tier, sp.name
            """
        )
        return [dict(r) for r in rows]
