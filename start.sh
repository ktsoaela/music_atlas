#!/usr/bin/env bash
# Start Neo4j (Docker) + API + frontend; PIDs land in .run/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
mkdir -p .run

if [[ -f .run/backend.pid || -f .run/frontend.pid ]]; then
  echo "Already running (see .run/). Use ./stop.sh first." >&2
  exit 1
fi

[[ -f .env ]] || cp .env.example .env
set -a
# shellcheck disable=SC1091
source .env
set +a
export NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
export NEO4J_USER="${NEO4J_USER:-neo4j}"
export NEO4J_PASSWORD="${NEO4J_PASSWORD:-samusicatlas}"

echo "Starting Neo4j…"
docker compose up neo4j -d

if [[ ! -x backend/.venv/bin/uvicorn ]]; then
  echo "Creating backend venv…"
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

echo "Starting API :8000…"
(
  cd backend
  nohup .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
    >"$ROOT/.run/backend.log" 2>&1 &
  echo $! >"$ROOT/.run/backend.pid"
)

if [[ ! -d frontend/node_modules ]]; then
  echo "Installing frontend deps…"
  (cd frontend && npm ci)
fi

echo "Starting frontend :3000…"
(
  cd frontend
  nohup npm run dev -- -H 0.0.0.0 >"$ROOT/.run/frontend.log" 2>&1 &
  echo $! >"$ROOT/.run/frontend.pid"
)

echo "Up."
echo "  Frontend  http://localhost:3000"
echo "  API docs  http://localhost:8000/docs"
echo "  Neo4j UI  http://localhost:7474"
echo "PIDs: backend=$(cat .run/backend.pid) frontend=$(cat .run/frontend.pid)"
echo "Logs: .run/backend.log  .run/frontend.log"
echo "Stop with: ./stop.sh"
