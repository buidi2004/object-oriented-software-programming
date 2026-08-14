#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CS="$ROOT/CloudServiceStore"
LOG_DIR="$ROOT"

echo "=== PRE-CHECKS ==="
if ! curl -sf http://localhost:5053/api/categories >/dev/null; then
  echo "BE: DOWN — starting docker compose..."
  cd "$ROOT"
  docker compose up -d webapi sqlserver redis 2>&1 | tail -5 || true
  for i in $(seq 1 30); do
    curl -sf http://localhost:5053/api/categories >/dev/null && break
    sleep 2
  done
fi
curl -sf http://localhost:5053/api/categories >/dev/null && echo "BE: UP" || echo "BE: DOWN"
curl -s http://localhost:5053/api/VpsInstances/health/docker || true
echo
docker exec cloudservicestore_api test -S /var/run/docker.sock 2>/dev/null && echo "DOCKER_SOCK: OK" || echo "DOCKER_SOCK: MISSING"

echo "=== APPLY VPS DB COLUMNS (idempotent) ==="
docker exec -i cloudservicestore_sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Your_Strong_Password_123!' -C -d CloudServiceStoreDb \
  < "$CS/scripts/apply-vps-spec-columns.sql" 2>/dev/null || true

echo "=== DOTNET E2E ==="
cd "$CS"
dotnet test CloudServiceStore.Tests/CloudServiceStore.Tests.csproj --filter 'FullyQualifiedName~E2E' \
  2>&1 | tee "$LOG_DIR/full-dotnet-rerun.log"
echo "DOTNET_EXIT:${PIPESTATUS[0]}"

echo "=== PLAYWRIGHT FULL FLOW ==="
fuser -k 3002/tcp 2>/dev/null || true
lsof -ti:3002 | xargs -r kill -9 2>/dev/null || true
sleep 2
cd "$ROOT/frontend"
npx playwright test tests/full-flow-e2e.spec.ts --workers=1 --retries=0 \
  2>&1 | tee "$LOG_DIR/full-playwright-rerun.log"
echo "PLAYWRIGHT_EXIT:${PIPESTATUS[0]}"

grep -E 'Passed!|Failed!|passed|failed' "$LOG_DIR/full-dotnet-rerun.log" | tail -3 || true
grep -E 'passed|failed|VPS Provision status' "$LOG_DIR/full-playwright-rerun.log" | tail -10 || true
