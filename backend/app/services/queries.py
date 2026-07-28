from __future__ import annotations

from neo4j import Driver

from app.models.schemas import (
    ArtistDetail,
    ArtistSummary,
    GenreDetail,
    GenreSummary,
    GraphLink,
    GraphNode,
    GraphPayload,
    PlaceNode,
    RelationshipEdge,
    SongSummary,
    SourceCite,
    TimelineEvent,
)

HUB_THRESHOLD = 12.0


def _influence_components(driver: Driver, artist_id: str) -> dict:
    query = """
    MATCH (a:Artist {id: $id})
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    OPTIONAL MATCH (a)-[:PIONEERED|CONTRIBUTED_TO]->(pg:Genre)
    OPTIONAL MATCH (a)-[:RECORDED|PRODUCED]->(s:Song)
    OPTIONAL MATCH (a)-[ar]-(other:Artist)
    OPTIONAL MATCH (e:Event)-[:ABOUT]->(a)
    OPTIONAL MATCH (a)-[:FROM|PERFORMED_IN|EXILED_IN]->(p:Place)
    WITH a,
         count(DISTINCT g) AS genres,
         count(DISTINCT pg) AS genre_builds,
         count(DISTINCT s) AS songs,
         count(DISTINCT other) AS artist_links,
         count(DISTINCT e) AS events,
         count(DISTINCT p) AS places,
         coalesce(a.active_from, 2000) AS start_year,
         coalesce(a.active_to, 2026) AS end_year
    RETURN genres, genre_builds, songs, artist_links, events, places, end_year - start_year AS span
    """
    with driver.session() as session:
        row = session.run(query, id=artist_id).single()
    if not row:
        return {"score": 0.0, "genres": 0, "songs": 0, "artist_links": 0, "events": 0, "places": 0, "span": 0}
    score = (
        row["artist_links"] * 3.0
        + row["genres"] * 2.0
        + row["genre_builds"] * 4.0
        + row["songs"] * 1.5
        + row["events"] * 2.0
        + row["places"] * 1.0
        + max(row["span"], 0) / 5.0
    )
    return {
        "score": round(score, 1),
        "genres": row["genres"],
        "genre_builds": row["genre_builds"],
        "songs": row["songs"],
        "artist_links": row["artist_links"],
        "events": row["events"],
        "places": row["places"],
        "span_years": row["span"],
    }


def list_artists(
    driver: Driver,
    q: str | None = None,
    genre: str | None = None,
    generation: int | None = None,
) -> list[ArtistSummary]:
    query = """
    MATCH (a:Artist)
    OPTIONAL MATCH (a)-[:FROM]->(p:Place)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    WITH a, p, collect(DISTINCT g.name) AS genres
    WHERE ($q IS NULL OR toLower(a.name) CONTAINS toLower($q)
           OR toLower(coalesce(a.stage_name, '')) CONTAINS toLower($q))
      AND ($genre IS NULL OR $genre IN genres)
      AND ($generation IS NULL OR a.generation = $generation)
    RETURN a, p, genres
    ORDER BY a.name
    """
    with driver.session() as session:
        rows = list(session.run(query, q=q, genre=genre, generation=generation))
    return [_artist_summary(driver, r["a"], r["p"], r["genres"]) for r in rows]


def list_hubs(driver: Driver, limit: int = 12) -> list[ArtistSummary]:
    artists = list_artists(driver)
    hubs = sorted(artists, key=lambda a: a.influence_score, reverse=True)
    return hubs[:limit]


def get_artist(driver: Driver, artist_id: str) -> ArtistDetail | None:
    query = """
    MATCH (a:Artist {id: $id})
    OPTIONAL MATCH (a)-[:FROM]->(p:Place)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    OPTIONAL MATCH (a)-[r]->(other:Artist)
    WITH a, p, collect(DISTINCT g.name) AS genres,
         collect(DISTINCT {type: type(r), direction: 'out', target_id: other.id, target_name: other.name, source_cite: r.source}) AS out_rels
    OPTIONAL MATCH (other2:Artist)-[r2]->(a)
    WITH a, p, genres, out_rels,
         collect(DISTINCT {type: type(r2), direction: 'in', target_id: other2.id, target_name: other2.name, source_cite: r2.source}) AS in_rels
    OPTIONAL MATCH (e:Event)-[:ABOUT]->(a)
    OPTIONAL MATCH (a)-[:RECORDED]->(s:Song)
    OPTIONAL MATCH (a)-[:EXILED_IN]->(ex:Place)
    RETURN a, p, genres, out_rels + in_rels AS rels, collect(DISTINCT e) AS events,
           collect(DISTINCT s) AS songs, collect(DISTINCT ex.name) AS exile_places
    """
    with driver.session() as session:
        row = session.run(query, id=artist_id).single()
        if not row:
            return None
        a = row["a"]
        base = _artist_summary(driver, a, row["p"], row["genres"])
        components = _influence_components(driver, artist_id)
        rels = [
            RelationshipEdge(**r)
            for r in row["rels"]
            if r.get("target_id")
        ]
        events = [
            TimelineEvent(
                id=e["id"],
                year=e["year"],
                title=e["title"],
                description=e.get("description"),
                kind=e.get("kind", "music"),
                related_artist_ids=[artist_id],
                related_artist_names=[a.get("stage_name") or a["name"]],
                genre=e.get("genre"),
                place=e.get("place"),
            )
            for e in row["events"]
            if e
        ]
        songs = [
            SongSummary(id=s["id"], title=s["title"], year=s.get("year"))
            for s in row["songs"]
            if s
        ]
        source_rows = session.run(
            """
            MATCH (a:Artist {id: $id})-[:CITED_IN]->(s:Source)
            RETURN s.id AS id, s.title AS title, s.tier AS tier, s.provider AS provider,
                   s.url AS url, s.excerpt AS excerpt
            ORDER BY s.tier, s.provider, s.title
            """,
            id=artist_id,
        )
        sources = [
            SourceCite(
                id=r["id"],
                title=r["title"],
                tier=int(r["tier"] or 5),
                provider=r["provider"] or "unknown",
                url=r["url"],
                excerpt=r["excerpt"],
            )
            for r in source_rows
        ]
        external_ids = {
            "mbid": a.get("mbid"),
            "wikidata_id": a.get("wikidata_id"),
            "discogs_id": a.get("discogs_id"),
            "wikipedia_url": a.get("wikipedia_url"),
            "musicbrainz_url": a.get("musicbrainz_url"),
            "wikidata_url": a.get("wikidata_url"),
            "discogs_url": a.get("discogs_url"),
        }
        return ArtistDetail(
            **base.model_dump(),
            bio=a.get("bio"),
            languages=list(a.get("languages") or []),
            relationships=rels,
            events=sorted(events, key=lambda x: x.year),
            songs=sorted(songs, key=lambda x: x.year or 0),
            legacy_map=components,
            exile_places=[x for x in row["exile_places"] if x],
            sources=sources,
            external_ids={k: v for k, v in external_ids.items() if v},
        )


def _artist_summary(driver: Driver, a, p, genres) -> ArtistSummary:
    components = _influence_components(driver, a["id"])
    score = components["score"]
    return ArtistSummary(
        id=a["id"],
        name=a["name"],
        stage_name=a.get("stage_name"),
        genres=[g for g in (genres or []) if g],
        roles=list(a.get("roles") or []),
        city=p["name"] if p else None,
        province=p.get("province") if p else None,
        active_from=a.get("active_from"),
        active_to=a.get("active_to"),
        influence_score=score,
        is_hub=score >= HUB_THRESHOLD,
        generation=a.get("generation"),
    )


def list_places(driver: Driver) -> list[PlaceNode]:
    query = """
    MATCH (p:Place)
    OPTIONAL MATCH (a:Artist)-[:FROM]->(loc:Place)
    WHERE loc = p OR (loc)-[:IN_PROVINCE|IN_COUNTRY*1..2]->(p)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    RETURN p, count(DISTINCT a) AS artist_count, collect(DISTINCT g.name) AS genres
    ORDER BY
      CASE p.kind
        WHEN 'country' THEN 0
        WHEN 'province' THEN 1
        WHEN 'city' THEN 2
        ELSE 3
      END,
      p.name
    """
    with driver.session() as session:
        return [
            PlaceNode(
                id=r["p"]["id"],
                name=r["p"]["name"],
                kind=r["p"]["kind"],
                province=r["p"].get("province"),
                lat=r["p"]["lat"],
                lng=r["p"]["lng"],
                artist_count=r["artist_count"],
                genres=[g for g in r["genres"] if g],
            )
            for r in session.run(query)
        ]


def place_artists(driver: Driver, place_id: str) -> list[ArtistSummary]:
    query = """
    MATCH (root:Place {id: $id})
    MATCH (a:Artist)-[:FROM]->(loc:Place)
    WHERE loc = root OR (loc)-[:IN_PROVINCE|IN_COUNTRY*1..2]->(root)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    OPTIONAL MATCH (a)-[:FROM]->(p:Place)
    RETURN DISTINCT a, p, collect(DISTINCT g.name) AS genres
    ORDER BY a.name
    """
    with driver.session() as session:
        return [
            _artist_summary(driver, r["a"], r["p"], r["genres"])
            for r in session.run(query, id=place_id)
        ]


def place_children(driver: Driver, place_id: str) -> list[PlaceNode]:
    query = """
    MATCH (parent:Place {id: $id})<-[:IN_PROVINCE|IN_COUNTRY]-(child:Place)
    OPTIONAL MATCH (a:Artist)-[:FROM]->(loc:Place)
    WHERE loc = child OR (loc)-[:IN_PROVINCE|IN_COUNTRY*1..2]->(child)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    RETURN child AS p, count(DISTINCT a) AS artist_count, collect(DISTINCT g.name) AS genres
    ORDER BY p.name
    """
    with driver.session() as session:
        return [
            PlaceNode(
                id=r["p"]["id"],
                name=r["p"]["name"],
                kind=r["p"]["kind"],
                province=r["p"].get("province"),
                lat=r["p"]["lat"],
                lng=r["p"]["lng"],
                artist_count=r["artist_count"],
                genres=[g for g in r["genres"] if g],
            )
            for r in session.run(query, id=place_id)
        ]


def geography_roots(driver: Driver) -> list[PlaceNode]:
    query = """
    MATCH (p:Place)
    WHERE p.kind = 'country'
    OPTIONAL MATCH (a:Artist)-[:FROM]->(loc:Place)
    WHERE loc = p OR (loc)-[:IN_PROVINCE|IN_COUNTRY*1..3]->(p)
    OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
    RETURN p, count(DISTINCT a) AS artist_count, collect(DISTINCT g.name) AS genres
    ORDER BY p.name
    """
    with driver.session() as session:
        return [
            PlaceNode(
                id=r["p"]["id"],
                name=r["p"]["name"],
                kind=r["p"]["kind"],
                province=r["p"].get("province"),
                lat=r["p"]["lat"],
                lng=r["p"]["lng"],
                artist_count=r["artist_count"],
                genres=[g for g in r["genres"] if g],
            )
            for r in session.run(query)
        ]


def influence_graph(driver: Driver, artist_id: str | None = None, depth: int = 2) -> GraphPayload:
    depth = max(1, min(depth, 4))
    with driver.session() as session:
        if artist_id:
            # Variable-length path; depth clamped above
            artist_nodes = session.run(
                f"""
                MATCH (start:Artist {{id: $id}})
                MATCH (start)-[:INSPIRED_BY|INFLUENCED|MENTORED|COLLABORATED_WITH|MEMBER_OF|SPOUSE_OF|PRODUCED_FOR*0..{depth}]-(other:Artist)
                RETURN collect(DISTINCT other) AS artists
                """,
                id=artist_id,
            ).single()["artists"]
        else:
            artist_nodes = [r["a"] for r in session.run("MATCH (a:Artist) RETURN a")]
    return _graph_from_artists(driver, artist_nodes)


def _graph_from_artists(driver: Driver, artists: list) -> GraphPayload:
    ids = [a["id"] for a in artists]
    with driver.session() as session:
        node_rows = session.run(
            """
            UNWIND $ids AS id
            MATCH (a:Artist {id: id})
            OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
            OPTIONAL MATCH (a)-[:FROM]->(p:Place)
            RETURN a.id AS id,
                   coalesce(a.stage_name, a.name) AS label,
                   collect(DISTINCT g.name) AS genres,
                   p.name AS city,
                   a.generation AS generation
            """,
            ids=ids,
        )
        nodes = [
            GraphNode(
                id=r["id"],
                label=r["label"],
                kind="artist",
                genres=[g for g in r["genres"] if g],
                city=r["city"],
                generation=r["generation"],
            )
            for r in node_rows
        ]
        link_rows = session.run(
            """
            UNWIND $ids AS id
            MATCH (a:Artist {id: id})-[r:INSPIRED_BY|INFLUENCED|MENTORED|COLLABORATED_WITH|MEMBER_OF|SPOUSE_OF|PRODUCED_FOR]->(b:Artist)
            WHERE b.id IN $ids
            RETURN a.id AS source, b.id AS target, type(r) AS type
            """,
            ids=ids,
        )
        links = [GraphLink(source=r["source"], target=r["target"], type=r["type"]) for r in link_rows]
    return GraphPayload(nodes=nodes, links=links)


def timeline(driver: Driver, genre: str | None = None) -> list[TimelineEvent]:
    query = """
    MATCH (e:Event)
    WHERE ($genre IS NULL OR e.genre = $genre)
    OPTIONAL MATCH (e)-[:ABOUT]->(a:Artist)
    RETURN e, collect(DISTINCT a.id) AS artist_ids, collect(DISTINCT coalesce(a.stage_name, a.name)) AS artist_names
    ORDER BY e.year
    """
    with driver.session() as session:
        return [
            TimelineEvent(
                id=r["e"]["id"],
                year=r["e"]["year"],
                title=r["e"]["title"],
                description=r["e"].get("description"),
                kind=r["e"].get("kind", "music"),
                related_artist_ids=[i for i in r["artist_ids"] if i],
                related_artist_names=[n for n in r["artist_names"] if n],
                genre=r["e"].get("genre"),
                place=r["e"].get("place"),
            )
            for r in session.run(query, genre=genre)
        ]


def list_genres(driver: Driver) -> list[GenreSummary]:
    query = """
    MATCH (g:Genre)
    OPTIONAL MATCH (a:Artist)-[:PLAYS]->(g)
    OPTIONAL MATCH (g)-[:ORIGINATED_IN]->(p:Place)
    RETURN g, count(DISTINCT a) AS artist_count, p.name AS origin_place
    ORDER BY coalesce(g.era_start, 9999), g.name
    """
    with driver.session() as session:
        return [
            GenreSummary(
                id=r["g"]["id"],
                name=r["g"]["name"],
                era_start=r["g"].get("era_start"),
                origin_place=r["origin_place"],
                artist_count=r["artist_count"],
            )
            for r in session.run(query)
        ]


def get_genre(driver: Driver, genre_id: str) -> GenreDetail | None:
    query = """
    MATCH (g:Genre {id: $id})
    OPTIONAL MATCH (g)-[:ORIGINATED_IN]->(p:Place)
    OPTIONAL MATCH (a:Artist)-[:PLAYS]->(g)
    OPTIONAL MATCH (a)-[:FROM]->(ap:Place)
    WITH g, p, collect(DISTINCT {a: a, ap: ap}) AS artist_rows
    OPTIONAL MATCH (g)-[:INFLUENCED_BY]->(parent:Genre)
    OPTIONAL MATCH (parent)<-[:PLAYS]-(pa:Artist)
    OPTIONAL MATCH (parent)-[:ORIGINATED_IN]->(pp:Place)
    WITH g, p, artist_rows,
         collect(DISTINCT {g: parent, count: count(DISTINCT pa), origin: pp.name}) AS parents_raw
    OPTIONAL MATCH (child:Genre)-[:INFLUENCED_BY]->(g)
    OPTIONAL MATCH (child)<-[:PLAYS]-(ca:Artist)
    OPTIONAL MATCH (child)-[:ORIGINATED_IN]->(cp:Place)
    RETURN g, p,
           artist_rows,
           parents_raw,
           collect(DISTINCT {g: child, count: count(DISTINCT ca), origin: cp.name}) AS children_raw
    """
    # Simpler reliable version:
    with driver.session() as session:
        row = session.run(
            """
            MATCH (g:Genre {id: $id})
            OPTIONAL MATCH (g)-[:ORIGINATED_IN]->(p:Place)
            OPTIONAL MATCH (a:Artist)-[:PLAYS]->(g)
            RETURN g, p.name AS origin, count(DISTINCT a) AS artist_count
            """,
            id=genre_id,
        ).single()
        if not row:
            return None
        g = row["g"]
        parents = [
            GenreSummary(
                id=r["pg"]["id"],
                name=r["pg"]["name"],
                era_start=r["pg"].get("era_start"),
                origin_place=r["origin"],
                artist_count=r["cnt"],
            )
            for r in session.run(
                """
                MATCH (g:Genre {id: $id})-[:INFLUENCED_BY]->(pg:Genre)
                OPTIONAL MATCH (pg)-[:ORIGINATED_IN]->(p:Place)
                OPTIONAL MATCH (a:Artist)-[:PLAYS]->(pg)
                RETURN pg, p.name AS origin, count(DISTINCT a) AS cnt
                """,
                id=genre_id,
            )
        ]
        children = [
            GenreSummary(
                id=r["cg"]["id"],
                name=r["cg"]["name"],
                era_start=r["cg"].get("era_start"),
                origin_place=r["origin"],
                artist_count=r["cnt"],
            )
            for r in session.run(
                """
                MATCH (cg:Genre)-[:INFLUENCED_BY]->(g:Genre {id: $id})
                OPTIONAL MATCH (cg)-[:ORIGINATED_IN]->(p:Place)
                OPTIONAL MATCH (a:Artist)-[:PLAYS]->(cg)
                RETURN cg, p.name AS origin, count(DISTINCT a) AS cnt
                """,
                id=genre_id,
            )
        ]
        artists = [
            _artist_summary(driver, r["a"], r["p"], r["genres"])
            for r in session.run(
                """
                MATCH (a:Artist)-[:PLAYS]->(g:Genre {id: $id})
                OPTIONAL MATCH (a)-[:FROM]->(p:Place)
                OPTIONAL MATCH (a)-[:PLAYS]->(gg:Genre)
                RETURN a, p, collect(DISTINCT gg.name) AS genres
                ORDER BY a.name
                """,
                id=genre_id,
            )
        ]
        pioneers = [
            _artist_summary(driver, r["a"], r["p"], r["genres"])
            for r in session.run(
                """
                MATCH (a:Artist)-[:PIONEERED|CONTRIBUTED_TO]->(g:Genre {id: $id})
                OPTIONAL MATCH (a)-[:FROM]->(p:Place)
                OPTIONAL MATCH (a)-[:PLAYS]->(gg:Genre)
                RETURN a, p, collect(DISTINCT gg.name) AS genres
                ORDER BY a.name
                """,
                id=genre_id,
            )
        ]
        culture_row = session.run(
            """
            MATCH (g:Genre {id: $id})
            OPTIONAL MATCH (g)-[:ROOTED_IN_CULTURE]->(c:Culture)
            OPTIONAL MATCH (g)-[:USES_INSTRUMENT]->(i:Instrument)
            RETURN collect(DISTINCT c.name) AS cultures, collect(DISTINCT i.name) AS instruments
            """,
            id=genre_id,
        ).single()
        return GenreDetail(
            id=g["id"],
            name=g["name"],
            era_start=g.get("era_start"),
            origin_place=row["origin"],
            artist_count=row["artist_count"],
            influenced_by=parents,
            influenced=children,
            artists=artists,
            pioneers=pioneers,
            cultures=[c for c in (culture_row["cultures"] if culture_row else []) if c],
            instruments=[i for i in (culture_row["instruments"] if culture_row else []) if i],
        )


def search_context(driver: Driver, question: str, artist_id: str | None = None) -> list[dict]:
    sources: list[dict] = []
    with driver.session() as session:
        if artist_id:
            row = session.run(
                """
                MATCH (a:Artist {id: $id})
                OPTIONAL MATCH (a)-[:FROM]->(p:Place)
                OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
                OPTIONAL MATCH (a)-[r]->(b:Artist)
                RETURN a, p.name AS city, collect(DISTINCT g.name) AS genres,
                       collect(DISTINCT {type: type(r), name: coalesce(b.stage_name, b.name), cite: r.source}) AS outs
                """,
                id=artist_id,
            ).single()
            if row:
                a = row["a"]
                sources.append(
                    {
                        "type": "artist",
                        "id": a["id"],
                        "name": a.get("stage_name") or a["name"],
                        "bio": a.get("bio"),
                        "city": row["city"],
                        "genres": row["genres"],
                        "relationships": [o for o in row["outs"] if o.get("name")],
                    }
                )
        tokens = [t for t in question.replace("?", " ").split() if len(t) > 2][:6]
        for token in tokens:
            rows = session.run(
                """
                MATCH (a:Artist)
                WHERE toLower(a.name) CONTAINS toLower($t)
                   OR toLower(coalesce(a.stage_name, '')) CONTAINS toLower($t)
                OPTIONAL MATCH (a)-[:FROM]->(p:Place)
                OPTIONAL MATCH (a)-[:PLAYS]->(g:Genre)
                OPTIONAL MATCH (a)-[r:INSPIRED_BY|INFLUENCED|MENTORED|COLLABORATED_WITH|MEMBER_OF|PRODUCED_FOR]->(b:Artist)
                OPTIONAL MATCH (a)-[:PIONEERED|CONTRIBUTED_TO]->(pg:Genre)
                RETURN a, p.name AS city, collect(DISTINCT g.name) + collect(DISTINCT pg.name) AS genres,
                       collect(DISTINCT {type: type(r), name: coalesce(b.stage_name, b.name)}) AS outs
                LIMIT 3
                """,
                t=token,
            )
            for r in rows:
                a = r["a"]
                entry = {
                    "type": "artist",
                    "id": a["id"],
                    "name": a.get("stage_name") or a["name"],
                    "bio": a.get("bio"),
                    "city": r["city"],
                    "genres": [g for g in r["genres"] if g],
                    "relationships": [o for o in r["outs"] if o.get("name")],
                }
                if entry["id"] not in {s.get("id") for s in sources}:
                    sources.append(entry)
        # Tiered documentary sources for matched artists
        artist_ids = [s["id"] for s in sources if s.get("type") == "artist" and s.get("id")]
        if artist_ids:
            for r in session.run(
                """
                UNWIND $ids AS id
                MATCH (a:Artist {id: id})-[:CITED_IN]->(src:Source)
                RETURN a.id AS artist_id, coalesce(a.stage_name, a.name) AS artist,
                       src.title AS title, src.tier AS tier, src.provider AS provider,
                       src.url AS url, src.excerpt AS excerpt
                ORDER BY src.tier
                LIMIT 20
                """,
                ids=artist_ids,
            ):
                sources.append(
                    {
                        "type": "citation",
                        "name": r["title"],
                        "artist": r["artist"],
                        "tier": r["tier"],
                        "provider": r["provider"],
                        "url": r["url"],
                        "excerpt": r["excerpt"],
                    }
                )
        genre_rows = session.run(
            """
            MATCH (g:Genre)
            WHERE any(t IN $tokens WHERE toLower(g.name) CONTAINS toLower(t))
            OPTIONAL MATCH (g)-[:ORIGINATED_IN]->(p:Place)
            OPTIONAL MATCH (g)-[:INFLUENCED_BY]->(parent:Genre)
            RETURN g.name AS name, p.name AS origin, collect(DISTINCT parent.name) AS parents
            """,
            tokens=tokens or [question],
        )
        for r in genre_rows:
            sources.append(
                {
                    "type": "genre",
                    "name": r["name"],
                    "origin": r["origin"],
                    "influenced_by": [p for p in r["parents"] if p],
                }
            )
    return sources[:12]
