#!/usr/bin/env python3
"""Battle tests for the India Open Gridworks++ scaffold.

These are offline/local smoke and contract tests intended to fail fast.
"""

from __future__ import annotations

import pathlib
import re
import subprocess
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def assert_contains(text: str, needle: str, where: str) -> None:
    assert needle in text, f"Missing '{needle}' in {where}"


def test_required_files_present() -> None:
    required = [
        "INDIA_OPENGRID_SUPPLY_CHAIN_MASTER_SPEC.md",
        "implementation/sql/schema.sql",
        "implementation/api/openapi.yaml",
        "implementation/config/layers.yaml",
        "implementation/etl/qa_rules.md",
        "webapp/index.html",
        "webapp/app.js",
        "webapp/styles.css",
    ]
    for rel in required:
        assert (ROOT / rel).exists(), f"Missing required file: {rel}"


def test_openapi_endpoints_present() -> None:
    api = read("implementation/api/openapi.yaml")
    for endpoint in [
        "/layers:",
        "/assets/search:",
        "/assets/{id}:",
        "/graph/{id}:",
        "/tiles/{layer}/{z}/{x}/{y}:",
        "/timeseries/{id}:",
    ]:
        assert_contains(api, endpoint, "implementation/api/openapi.yaml")


def test_schema_core_tables_present() -> None:
    schema = read("implementation/sql/schema.sql")
    for table in [
        "CREATE TABLE IF NOT EXISTS assets",
        "CREATE TABLE IF NOT EXISTS asset_relationships",
        "CREATE TABLE IF NOT EXISTS layers",
        "CREATE TABLE IF NOT EXISTS asset_timeseries",
        "CREATE TABLE IF NOT EXISTS etl_runs",
        "CREATE TABLE IF NOT EXISTS quality_issues",
    ]:
        assert_contains(schema, table, "implementation/sql/schema.sql")


def test_url_state_contract_in_webapp() -> None:
    js = read("webapp/app.js")
    for key in ["lat", "lng", "z", "layers", "panel", "selected", "time"]:
        assert re.search(rf"q\.set\('{key}'|params\.get\('{key}'", js), f"URL state key '{key}' missing in webapp/app.js"


def test_webapp_serves_homepage() -> None:
    cmd = ["python3", "-m", "http.server", "4180", "--directory", str(ROOT / "webapp")]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(1.0)
        body = urllib.request.urlopen("http://127.0.0.1:4180/", timeout=5).read().decode("utf-8")
        assert "India Open Gridworks++" in body, "Homepage title missing from served HTML"
        assert "app.js" in body, "app.js script tag missing from served HTML"
    finally:
        proc.kill()
        proc.wait(timeout=5)


def test_no_api_key_dependency_in_frontend() -> None:
    html = read("webapp/index.html")
    js = read("webapp/app.js")
    combined = f"{html}\n{js}".lower()
    forbidden_patterns = ["api_key", "apikey", "authorization: bearer", "x-api-key"]
    for p in forbidden_patterns:
        assert p not in combined, f"Found key dependency pattern in frontend: {p}"


if __name__ == "__main__":
    tests = [obj for name, obj in globals().items() if name.startswith("test_") and callable(obj)]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except Exception as exc:
            failed += 1
            print(f"FAIL {t.__name__}: {exc}")
    if failed:
        raise SystemExit(1)
    print(f"All {len(tests)} battle tests passed.")
