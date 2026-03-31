#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p artifacts

echo "[1/4] Running battle tests..."
python3 tests/battle_test.py

echo "[2/4] Starting local web host on :4173..."
python3 -m http.server 4173 --directory webapp >/tmp/webapp_server.log 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT

ready=0
for _ in {1..20}; do
  if curl -sSf http://127.0.0.1:4173/ >/dev/null; then
    ready=1
    break
  fi
  sleep 0.3
done
if [ "$ready" -ne 1 ]; then
  echo "Server failed to start. Log tail:" >&2
  tail -n 40 /tmp/webapp_server.log >&2 || true
  exit 1
fi

curl -sSf http://127.0.0.1:4173/ > artifacts/webapp-homepage.html

echo "[3/4] Capturing local screenshot to /tmp (not committed)..."
npx -y playwright@1.54.2 screenshot --device='Desktop Chrome' http://127.0.0.1:4173 /tmp/webapp-homepage.png >/tmp/playwright_screenshot.log 2>&1 || true

if [ -f /tmp/webapp-homepage.png ]; then
  SCREENSHOT_STATUS="generated:/tmp/webapp-homepage.png"
else
  SCREENSHOT_STATUS="not-generated"
fi

echo "[4/4] Writing execution report..."
{
  echo "timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "host_url=http://127.0.0.1:4173"
  echo "battle_tests=passed"
  echo "homepage_snapshot=artifacts/webapp-homepage.html"
  echo "screenshot=${SCREENSHOT_STATUS}"
} > artifacts/execution-report.txt

echo "Done."
echo "- Host URL: http://127.0.0.1:4173"
echo "- HTML snapshot: artifacts/webapp-homepage.html"
echo "- Execution report: artifacts/execution-report.txt"
echo "- Screenshot: ${SCREENSHOT_STATUS}"
