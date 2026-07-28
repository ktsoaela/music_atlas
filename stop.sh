#!/usr/bin/env bash
# Kill every tracked PID (and children), free project ports, stop Docker.
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

kill_tree() {
  local pid=$1
  local kids
  kids="$(pgrep -P "$pid" 2>/dev/null || true)"
  for c in $kids; do
    kill_tree "$c"
  done
  kill -TERM "$pid" 2>/dev/null || true
  sleep 0.2
  kill -KILL "$pid" 2>/dev/null || true
}

echo "Stopping tracked PIDs…"
if [[ -d .run ]]; then
  for f in .run/*.pid; do
    [[ -f "$f" ]] || continue
    pid="$(cat "$f" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]]; then
      echo "  kill tree $pid ($f)"
      kill_tree "$pid"
    fi
    rm -f "$f"
  done
fi

echo "Freeing ports 3000 8000…"
for port in 3000 8000; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "  kill port $port → $pids"
    # shellcheck disable=SC2086
    kill -KILL $pids 2>/dev/null || true
  fi
done

echo "Stopping Docker services…"
docker compose down 2>/dev/null || true

echo "Down."
