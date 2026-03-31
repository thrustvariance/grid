# Execution Plan (Applied from Master Spec)

This file turns the master specification into immediate implementation tasks.

## Completed in this commit
1. Created canonical SQL/PostGIS schema for assets, relationships, layers, time series, ETL runs, and quality issues.
2. Defined initial layer catalog and URL-state contract in YAML.
3. Drafted OpenAPI v3 contract for core endpoints.
4. Added ETL QA rulebook for ingestion and validation.

## Next execution tasks
1. Provision Postgres + PostGIS and apply `implementation/sql/schema.sql`.
2. Seed `layers` table from `implementation/config/layers.yaml`.
3. Scaffold API service stubs directly from `implementation/api/openapi.yaml`.
4. Build ETL pipeline modules:
   - source adapters
   - entity resolution
   - geometry normalization
   - quality rule engine
5. Integrate first data domains:
   - plants, tx, subs
   - coal mines + railheads + ports
   - gas pipelines + LNG terminals
6. Stand up vector tile server for layers.
7. Implement URL-state persistence in frontend map client.

## Definition of done for Phase 0 parity
- Layer toggles working for plants/tx/subs/datacenters/hpoints.
- URL parameters `lat,lng,z,layers,panel,selected,time` round-trip correctly.
- Asset detail panel opens from map selection with metadata card.
