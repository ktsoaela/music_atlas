# Southern African Music Atlas

Knowledge graph of Southern African music history: artists, places, genres, influence, timeline, map, and an AI assistant grounded in Neo4j.

## Stack

- **Neo4j** — graph database
- **FastAPI** — REST API + graph-grounded Q&A
- **Next.js** — map, timeline, influence graph, artist pages, ask UI
- **Ponytail** — Cursor rule at `.cursor/rules/ponytail.mdc` (YAGNI / minimal diffs)

## Quick start

```bash
cp .env.example .env
# optional: set OPENAI_API_KEY for LLM answers

./start.sh    # Neo4j + API + frontend (PIDs in .run/)
./stop.sh     # kill all tracked PIDs, free ports, docker compose down
```

Or all-in-Docker: `docker compose up --build`.

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| API docs | http://localhost:8000/docs   |
| Neo4j UI | http://localhost:7474        |

Neo4j login: `neo4j` / `samusicatlas`

On startup the API **reseeds** the graph from `backend/app/data/seed.cypher`.

### Local dev (without Docker for app code)

```bash
docker compose up neo4j -d

cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export NEO4J_URI=bolt://localhost:7687 NEO4J_PASSWORD=samusicatlas
uvicorn app.main:app --reload --port 8000

cd ../frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## API surface

- `GET /api/artists` · `GET /api/artists/{id}`
- `GET /api/places` · `GET /api/places/{id}/artists`
- `GET /api/graph/influence?artist_id=`
- `GET /api/timeline` · `GET /api/genres`
- `POST /api/ai/ask` `{ "question": "...", "artist_id": null }`
- `GET /api/sources/tiers` · `GET /api/sources/providers`
- `POST /api/admin/enrich?limit=15` — Wikidata / MusicBrainz / Wikipedia (+ Discogs if `DISCOGS_TOKEN`)
- `POST /api/admin/reseed`

## Source tiers

Evidence is tiered (see `/sources`): Tier 1 Wikidata/MusicBrainz/Discogs → Tier 2 Wikipedia/books/archives → Tier 3 interviews/podcasts → Tier 4 press → Tier 5 leads only. Curated citations ship in `backend/app/data/sources.cypher`; live enrich fills external IDs.

## Seed scope

Cape Flats → Gauteng hip hop, kwaito, Durban gqom/trap, Gauteng amapiano (incl. MFR Souls, Major League DJz), **Lekompo** (Limpopo / Bolobedu House / Tsa Manyalo lineage), the **Lesotho corridor** (Sankomota, Tsepo Tshola), **Brenda Fassie** and bubblegum hubs, **Eastern Cape** afro-soul/pop (Ringo, Simphiwe Dana, Thandiswa, Ami Faku, Zahara, Zolani Mahola), and **Jabu Khanyile / Bayete** with pan-African collaborators. Expand `backend/app/data/seed.cypher` as research grows; keep relationship `source` citations.

Browse by geography: `/geography` or `GET /api/places/geography`. Cultures & languages: `/cultures`.

## Cultural layer

`backend/app/data/culture.cypher` seeds **Language**, **Culture**, **Instrument** nodes plus **Famo** (Basotho / migrant labour) and **Motswako** (Setswana / Mahikeng–Botswana corridor), with `MIGRATION_CORRIDOR` place links.

## Vision

See [docs/plan.md](docs/plan.md) for the full atlas roadmap (Gramps research workflow, richer tabs, multi-genre timelines, cultural graphs beyond music).

## License

Private / proprietary — all rights reserved. See [LICENSE](LICENSE). Not open source; copying or redistribution is not permitted.
