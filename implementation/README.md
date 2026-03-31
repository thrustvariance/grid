# India Open Gridworks++ Implementation Pack

This directory is the executable baseline generated from `INDIA_OPENGRID_SUPPLY_CHAIN_MASTER_SPEC.md`.

## Contents
- `sql/schema.sql` — canonical database schema (PostGIS + graph-friendly relationship tables).
- `config/layers.yaml` — initial map layer taxonomy and URL-state contract.
- `api/openapi.yaml` — API contract for layers, assets, graph traversal, tiles, and timeseries.
- `etl/qa_rules.md` — QA validations for ingestion and entity consistency.
- `docs/execution_plan.md` — step-by-step implementation tasks and phase completion criteria.

## Quick start
1. Apply DB schema.
2. Seed layer definitions.
3. Generate API stubs from OpenAPI.
4. Connect ETL workflows and QA checks.
