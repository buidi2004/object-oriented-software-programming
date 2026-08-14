#!/bin/bash
# ============================================================
# Schemathesis API Fuzzing Script for CloudServiceStore
# Targets: Orders, Payments, Coupons endpoints
# ============================================================
set -euo pipefail

# --- Configuration ---
BASE_URL="${BASE_URL:-https://localhost:5001}"
SWAGGER_URL="${BASE_URL}/swagger/v1/swagger.json"
AUTH_EMAIL="${AUTH_EMAIL:-test@test.com}"
AUTH_PASSWORD="${AUTH_PASSWORD:-YourTestPassword}"
PATH_REGEX="${PATH_REGEX:-/api/(orders|payments|coupons)}"

echo "=== CloudServiceStore API Fuzzing ==="
echo "Base URL: ${BASE_URL}"
echo "Target paths: ${PATH_REGEX}"
echo ""

# --- Step 1: Get auth token ---
echo "[1/3] Authenticating..."
TOKEN=$(curl -sk -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${AUTH_EMAIL}\",\"password\":\"${AUTH_PASSWORD}\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "WARNING: Could not obtain auth token. Proceeding without auth."
  echo "  Some [Authorize] endpoints will return 401."
  AUTH_HEADER=""
else
  echo "  Token obtained successfully."
  AUTH_HEADER="--header Authorization:Bearer ${TOKEN}"
fi

# --- Step 2: Run Schemathesis ---
echo ""
echo "[2/3] Running Schemathesis..."
schemathesis run "${SWAGGER_URL}" \
  ${AUTH_HEADER} \
  --include-path-regex "${PATH_REGEX}" \
  --checks all \
  --validate-schema true \
  --max-response-time 5000 \
  2>&1 | tee schemathesis-report.txt

echo ""
echo "[3/3] Done! Report saved to schemathesis-report.txt"
