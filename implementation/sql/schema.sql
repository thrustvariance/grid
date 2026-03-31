-- India Open Gridworks++: canonical relational + geospatial schema (PostgreSQL + PostGIS)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE asset_status AS ENUM (
  'announced',
  'planned',
  'under_construction',
  'commissioned',
  'derated',
  'outage',
  'retired',
  'mothballed'
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT,
  district TEXT,
  subdistrict TEXT,
  status asset_status NOT NULL,
  owner_operator TEXT,
  developer TEXT,
  epc TEXT,
  commissioning_date DATE,
  expected_cod DATE,
  retirement_date DATE,
  technical_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.500 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  last_verified_at TIMESTAMPTZ,
  source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  geom geometry(Geometry, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_state ON assets(state);
CREATE INDEX IF NOT EXISTS idx_assets_geom ON assets USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_assets_technical_specs ON assets USING GIN(technical_specs);

CREATE TABLE IF NOT EXISTS asset_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  to_asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  relation_kind TEXT NOT NULL, -- supply_dependency, offtake_dependency, electrical_connection, logistics_route
  weight NUMERIC(8,4),
  valid_from DATE,
  valid_to DATE,
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.500 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_asset_id, to_asset_id, relation_kind, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_asset_relationships_from ON asset_relationships(from_asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_relationships_to ON asset_relationships(to_asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_relationships_kind ON asset_relationships(relation_kind);

CREATE TABLE IF NOT EXISTS layers (
  layer_id TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  min_zoom NUMERIC(3,1) NOT NULL DEFAULT 0,
  max_zoom NUMERIC(3,1) NOT NULL DEFAULT 24,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  style_token TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_timeseries (
  observation_id BIGSERIAL PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  observed_at TIMESTAMPTZ NOT NULL,
  quality_flag TEXT,
  source_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_timeseries_asset_metric_time
  ON asset_timeseries(asset_id, metric_name, observed_at DESC);

CREATE TABLE IF NOT EXISTS etl_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name TEXT NOT NULL,
  source_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  run_status TEXT NOT NULL,
  records_in BIGINT DEFAULT 0,
  records_out BIGINT DEFAULT 0,
  errors_count BIGINT DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS quality_issues (
  issue_id BIGSERIAL PRIMARY KEY,
  run_id UUID REFERENCES etl_runs(run_id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(asset_id) ON DELETE SET NULL,
  rule_name TEXT NOT NULL,
  severity TEXT NOT NULL,
  issue_message TEXT NOT NULL,
  issue_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Derived view for upstream/downstream traversal seed quality.
CREATE OR REPLACE VIEW v_supply_chain_edges AS
SELECT
  ar.relationship_id,
  ar.from_asset_id,
  a_from.name AS from_name,
  ar.to_asset_id,
  a_to.name AS to_name,
  ar.relation_kind,
  ar.weight,
  ar.confidence_score
FROM asset_relationships ar
JOIN assets a_from ON a_from.asset_id = ar.from_asset_id
JOIN assets a_to ON a_to.asset_id = ar.to_asset_id
WHERE ar.relation_kind IN ('supply_dependency', 'offtake_dependency', 'logistics_route');
