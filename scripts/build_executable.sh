#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 -m pip install --quiet pyinstaller
pyinstaller --onefile --name OpenGridworksLauncher --add-data "webapp:webapp" run_localhost.py

echo "Built executable: dist/OpenGridworksLauncher"
echo "Run: ./dist/OpenGridworksLauncher"
