from pathlib import Path
from neo4j import Driver

from app.services.enrich import seed_source_providers

DATA = Path(__file__).resolve().parent.parent / "data"
SEED_PATH = DATA / "seed.cypher"
SOURCES_PATH = DATA / "sources.cypher"
CULTURE_PATH = DATA / "culture.cypher"


def _statements(cypher: str) -> list[str]:
    cleaned_lines = []
    for line in cypher.splitlines():
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        cleaned_lines.append(line)
    cleaned = "\n".join(cleaned_lines)
    return [s.strip() for s in cleaned.split(";") if s.strip()]


def run_seed(driver: Driver) -> dict:
    statements = _statements(SEED_PATH.read_text())
    if CULTURE_PATH.exists():
        statements.extend(_statements(CULTURE_PATH.read_text()))
    if SOURCES_PATH.exists():
        statements.extend(_statements(SOURCES_PATH.read_text()))
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        for stmt in statements:
            session.run(stmt)
        counts = session.run(
            """
            MATCH (a:Artist) WITH count(a) AS artists
            MATCH (p:Place) WITH artists, count(p) AS places
            MATCH (g:Genre) WITH artists, places, count(g) AS genres
            MATCH (e:Event) WITH artists, places, genres, count(e) AS events
            MATCH (s:Song) WITH artists, places, genres, events, count(s) AS songs
            MATCH (src:Source) WITH artists, places, genres, events, songs, count(src) AS sources
            MATCH (l:Language) WITH artists, places, genres, events, songs, sources, count(l) AS languages
            MATCH (i:Instrument) WITH artists, places, genres, events, songs, sources, languages, count(i) AS instruments
            MATCH (c:Culture) WITH artists, places, genres, events, songs, sources, languages, instruments, count(c) AS cultures
            MATCH ()-[r]->()
            RETURN artists, places, genres, events, songs, sources, languages, instruments, cultures, count(r) AS relationships
            """
        ).single()
    providers = seed_source_providers(driver)
    out = dict(counts)
    out["source_providers"] = providers
    return out
