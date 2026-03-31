# India Open Gridworks++ Master Specification (Generation + Full Energy Supply Chain)

## 1) Objective
Build an India-focused platform that **replicates and exceeds** the functional depth of the OpenGridWorks power-plant experience (map layers, spatial navigation, asset details, filtering, network context), while adding **end-to-end supply chain intelligence** from primary energy extraction to final load.

This document is intended to be implementation-ready for product, data engineering, geospatial, and grid analysts.

---

## 2) Scope

### 2.1 In scope
- National coverage: India (all states + union territories + offshore EEZ-relevant energy assets).
- Multi-layer map and side-panel UX equivalent to modern utility-grid intelligence maps.
- Asset classes:
  - Generation (thermal, hydro, nuclear, solar, wind, biomass, waste-to-energy, captive, hybrid).
  - Transmission and substation network (interstate, intrastate, cross-border interconnections).
  - Demand nodes (industry clusters, metros, rail traction, data centers, ports, agricultural feeders).
  - Supply-chain network for each fuel/technology family.
- Time-aware data model (planned, under-construction, commissioned, retired, derated, outage).
- Scenario and risk overlays (weather, water stress, fuel stress, congestion, curtailment).

### 2.2 Out of scope (phase 1)
- Real-time SCADA telemetry ingestion from proprietary state utility systems (unless explicitly licensed).
- Trading execution and market order routing.

---

## 3) Product Vision
**One map, one graph, full stack:** extraction/import → logistics → conversion/generation → transmission/distribution → end-use demand.

Core differentiator versus a pure power-plant map:
- Track upstream constraints (coal evacuation, LNG terminal utilization, gas pipeline pressure proxies, rail link bottlenecks, water availability, import chokepoints).
- Quantify downstream impact (nodal risk, congestion cost, demand center exposure, load shedding probability proxies).

---

## 4) User Personas
- Grid planners (CTU/STU/transco analysts).
- Private developers (generation/storage/RE park developers).
- Data center site selection teams.
- Industrial offtaker procurement teams.
- Policy and think tank researchers.
- Commodity/fuel logistics analysts.

---

## 5) Functional Requirements

### 5.1 Base map + navigation
- Smooth pan/zoom with URL state persistence:
  - `lat`, `lng`, `z`, `layers`, `panel`, selected asset ID.
- Layer toggle groups with hierarchical control.
- Cluster and decluster logic by zoom level.
- Temporal slider for status/date snapshots.

### 5.2 Side panel behavior
- Closed/open states.
- Contextual panel on selection:
  - Summary
  - Technical specs
  - Ownership
  - Permits/approvals
  - Fuel/supply dependencies
  - Network adjacency
  - Reliability/risk metrics
  - Documents/links

### 5.3 Search
- Asset name autocomplete.
- State/district lookup.
- Voltage/fuel/owner/capacity/status filters.
- Supply chain route query (e.g., `mine -> plant`, `LNG terminal -> CGD cluster`).

### 5.4 Relationship graph view
- For selected node, show upstream/downstream graph:
  - Example for coal plant: mine/source blend, rail corridor, washeries, pithead/port mix, stock days.
  - Example for gas plant: terminal/pipeline/city-gate chain and contractual dependencies.

### 5.5 Alerting + anomaly panel
- Fuel stock stress thresholds.
- Outage and derating changes.
- Transmission congestion and forced redispatch hotspots.
- Curtailment and renewable generation anomalies.

---

## 6) Layer Taxonomy (India, extended)

## 6.1 Power system layers (replication baseline)
- `plants` (all generation units).
- `tx` (EHV/HV lines, AC/DC).
- `subs` (substations, switching stations, pooling substations).
- `rowTx` and `rowSubs` proxies (right-of-way and corridor constraints where available).
- `hpoints` (high impact nodes / high-value hubs).
- `datacenters` (existing + announced).

## 6.2 Supply-side extraction and inputs
- Coal mines (CIL blocks, captive mines), washeries.
- Lignite mines.
- Oil & gas fields (onshore/offshore).
- Uranium/strategic nuclear fuel process nodes (only public-safe granularity).
- Biomass aggregation clusters.
- Municipal solid waste feedstock nodes.
- Renewable resource envelopes (solar irradiation, wind atlas layers).

## 6.3 Import/export + logistics layers
- Major and minor ports with energy handling capability.
- LNG terminals (existing/planned/FSRU).
- Coal import terminals and unloading constraints.
- Dedicated freight corridors + key railheads.
- Pipeline network (gas trunk + spur + CGD interfaces).
- Inland waterways energy movement corridors where applicable.

## 6.4 Conversion and intermediate infrastructure
- Refineries, petrochemical-to-fuel output links.
- Gas processing and compression stations.
- Coal washeries and blending points.
- Transmission pooling stations for RE zones.
- Battery manufacturing clusters and storage integration zones.

## 6.5 Demand and offtake layers
- DISCOM boundaries and aggregate technical profile.
- Industrial corridors and SEZ loads.
- Metro rail and traction substations.
- Water utilities and desalination/high-load utilities.
- Data centers and AI compute campuses.
- Agricultural feeder concentration zones.

## 6.6 Risk and constraints layers
- Water stress (basin and district overlays).
- Flood, cyclone, heatwave exposure.
- Seismic and landslide risk (for corridor planning).
- Land-use and protected area constraints.
- Air quality non-attainment zones (siting sensitivity).

---

## 7) Canonical Asset Data Model

Each asset record should support:
- `asset_id` (stable UUID)
- `asset_type` (plant, line, substation, mine, terminal, pipeline, demand_node, etc.)
- `name`, `aliases`
- `geometry` (point/line/polygon + simplification levels)
- `admin` (country/state/district/subdistrict)
- `status` (planned, announced, UC, commissioned, retired, mothballed)
- `owner_operator`, `developer`, `EPC` (if public)
- `commissioning_date`, `expected_cod`, `retirement_date`
- `technical_specs` JSON per type:
  - generation: fuel, technology, unit sizes, net/gross MW, heat rate, PLF history
  - transmission: kV, circuit count, conductor type, thermal limits
  - pipeline: diameter, pressure class, throughput design
  - LNG/port: tankage, regas capacity, unload constraints
- `supply_dependencies` (array of linked assets + weights)
- `offtake_dependencies` (array)
- `regulatory` (clearances, filing IDs where public)
- `confidence_score` and `last_verified_at`
- `source_refs` (citation list)

---

## 8) India-Specific Domain Logic

### 8.1 Grid hierarchy
- Separate modeling for ISTS vs InSTS.
- Central/state/private ownership delineation.
- Regional transfer corridor capacities and dynamic constraints.

### 8.2 Market structure overlays
- DAM/RTM/GDAM participation proxies.
- Ancillary and reserve relevance by node/asset type.
- Renewable must-run and curtailment-prone zones.

### 8.3 RE integration specifics
- Solar/wind hybrid parks.
- GNA and evacuation readiness indicators.
- Storage coupling (BESS/PHES) status and grid services capability.

### 8.4 Thermal reliability specifics
- Coal quality and transport route sensitivity.
- Imported coal price exposure and blend ratio risk.
- Cooling technology and basin-level water vulnerability.

---

## 9) Data Sources Strategy (authoritative-first)

### 9.1 Primary public sources (examples)
- CEA, POSOCO/GRID-INDIA, CERC, SERC portals.
- PGCIL and STU filings.
- Ministry datasets (Power, Coal, Petroleum & Natural Gas, New & Renewable Energy).
- Port authority datasets and rail freight statistics.
- State DISCOM filings and tariff orders.

### 9.2 Commercial/partner feeds (optional)
- Satellite and AIS-derived logistics signals.
- High-frequency outage and dispatch proxies.
- Commodity benchmarks and shipping movements.

### 9.3 Data trust framework
- Gold/Silver/Bronze confidence tiers.
- Asset-level provenance and timestamp.
- Contradiction detection pipeline for multi-source conflicts.

---

## 10) ETL and Update Cadence

### 10.1 Cadence
- Static geography/administrative boundaries: monthly.
- Asset status and capacity updates: weekly.
- Operational indicators (where available): daily or intraday.
- Risk/weather overlays: hourly to daily.

### 10.2 ETL pipeline
1. Ingest raw source dumps/APIs.
2. Normalize naming and identifiers.
3. Geocode/geometry correction.
4. Entity resolution and dedupe.
5. Relationship linking (supply/offtake graph).
6. Validation checks.
7. Publish to serving layers and snapshots.

### 10.3 QA rules
- Impossible coordinate checks.
- Capacity sanity bounds by technology.
- Line voltage/length consistency checks.
- Temporal logic checks (`COD` cannot precede clearance dates where linked).

---

## 11) API and Query Contract

### 11.1 Core APIs
- `/layers`
- `/assets/search`
- `/assets/{id}`
- `/graph/{id}?direction=upstream|downstream`
- `/tiles/{layer}/{z}/{x}/{y}` vector tiles
- `/timeseries/{id}`

### 11.2 URL state compatibility pattern
- `?lat=<>&lng=<>&z=<>&layers=<csv>&panel=open|closed&selected=<asset_id>&time=<iso>`

### 11.3 Graph query examples
- Upstream chain depth-limited traversal.
- Vulnerability analysis from disrupted node set.

---

## 12) UX Requirements (high detail)
- Layer legend with semantic colors and dynamic scale notes.
- Multi-select compare mode (up to N assets).
- Route tracing animation for supply chain paths.
- Explainability cards for derived risk scores.
- Downloadable asset report (PDF/CSV/GeoJSON where policy permits).
- Keyboard accessibility and mobile-responsive panel behavior.

---

## 13) Derived Metrics and Analytics

### 13.1 Asset reliability metrics
- Forced outage frequency proxy.
- Derating days per quarter.
- Fuel sufficiency days.

### 13.2 Network adequacy metrics
- Corridor saturation index.
- Substation criticality index.
- RE evacuation readiness score.

### 13.3 Supply-chain resilience metrics
- Single-point dependency score.
- Multimodal logistics flexibility score.
- Import dependency risk (commodity and route).

### 13.4 Demand exposure metrics
- Load-at-risk for major demand hubs.
- Data-center power quality exposure index.

---

## 14) Security, Privacy, and Responsible Disclosure
- No publication of sensitive critical-infrastructure details beyond public domain granularity.
- Role-based access for advanced internal layers.
- Differential detail levels by user role.
- Audit logs for data changes and access patterns.

---

## 15) Performance and SLOs
- Initial map load p95 < 2.5s on broadband.
- Layer toggle response p95 < 500ms (cached tiles).
- Search p95 < 300ms for top 20 results.
- 99.9% monthly API availability target.

---

## 16) Proposed Technology Stack
- Geospatial store: PostGIS + COG/object storage for rasters.
- Tile serving: vector tile server (MVT).
- Graph engine: Neo4j/JanusGraph or Postgres graph extension strategy.
- API: typed service layer (REST + optional GraphQL).
- Frontend: WebGL map client + React/Vue side panel.
- Orchestration: scheduled ETL + validation workflows.

---

## 17) Delivery Plan

### Phase 0 (4-6 weeks)
- Core basemap, plants/tx/substations, URL state parity.

### Phase 1 (6-10 weeks)
- Supply chain layers for coal/gas + ports + pipelines + railheads.
- Asset detail panel v1 and upstream/downstream graph.

### Phase 2 (8-12 weeks)
- Risk overlays, derived metrics, anomaly detection.
- Data center and industrial load intelligence.

### Phase 3 (continuous)
- Market overlays, forecasting, scenario simulation, enterprise controls.

---

## 18) Acceptance Criteria
- India map reaches parity with baseline map interactions (pan/zoom/layers/panel/search).
- At least 90% of utility-scale generation capacity represented with verified status.
- Supply chain graph resolves end-to-end dependencies for coal and gas fleets.
- Users can identify at-risk demand hubs from upstream disruptions in <= 3 clicks.

---

## 19) Deliverables
- Production-ready geospatial data dictionary.
- Asset schema definitions and API specs.
- Layer style guide and cartography tokens.
- Data quality runbook and incident SOP.
- Change-log and source provenance catalog.

---

## 20) Notes on the referenced URL
The reference URL appears to use map-state parameters (`lat`, `lng`, `z`, `layers`, `panel`) and layer toggles such as transmission and critical hubs. This specification preserves those interaction patterns and extends them with full supply-chain depth for India.

