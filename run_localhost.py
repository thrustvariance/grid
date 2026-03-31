#!/usr/bin/env python3
"""One-click localhost launcher for India Open Gridworks++ web UI."""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path

PORT = int(os.getenv("GRIDWORKS_PORT", "4173"))

if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    base = Path(sys._MEIPASS)  # type: ignore[attr-defined]
else:
    base = Path(__file__).resolve().parent

WEBAPP = base / "webapp"
if not WEBAPP.exists():
    raise SystemExit(f"webapp directory not found at {WEBAPP}")

os.chdir(WEBAPP)
handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
    url = f"http://127.0.0.1:{PORT}"
    print(f"India Open Gridworks++ running at {url}")
    print("Press Ctrl+C to stop.")

    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Stopping server...")
