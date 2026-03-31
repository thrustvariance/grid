# Battle Testing Guide

## One-command full execution (battle test + host + evidence)

```bash
./scripts/execute_all.sh
```

This command does all of the following:
1. Runs `python3 tests/battle_test.py`.
2. Hosts the website locally at `http://127.0.0.1:4173`.
3. Captures repository-safe evidence files:
   - `artifacts/webapp-homepage.html`
   - `artifacts/execution-report.txt`
4. Attempts a local screenshot to `/tmp/webapp-homepage.png` (ephemeral, not committed).

## Local executable (no Python command needed)

Build a native launcher binary (Linux) using PyInstaller:

```bash
./scripts/build_executable.sh
./dist/OpenGridworksLauncher
```

If you do not want to build a binary, run directly:

```bash
./run_localhost.py
```

## Manual commands

Run all local battle tests:

```bash
python3 tests/battle_test.py
```

Host locally:

```bash
python3 -m http.server 4173 --directory webapp
```

Capture screenshot to temp (requires Playwright deps):

```bash
npx -y playwright@1.54.2 screenshot --device='Desktop Chrome' http://127.0.0.1:4173 /tmp/webapp-homepage.png
```

## What battle tests validate
- Required project artifacts are present.
- OpenAPI includes the expected endpoint contract.
- SQL schema includes all core tables and supply-chain structures.
- Frontend enforces URL-state contract fields.
- Web app can be hosted locally and served successfully.
- Frontend has no API-key dependency patterns.

## Why no API keys are needed
This prototype works without API keys because:
1. It is a static client (`index.html` + `app.js` + `styles.css`) with embedded sample data.
2. It uses public OpenStreetMap raster tiles through Leaflet (no secret keys in this scaffold).
3. No protected backend integration is wired yet; the OpenAPI file is a contract stub for future implementation.

For production, you would likely add authenticated APIs and potentially managed map tile providers that require keys.
