# ETL QA Rules (Phase 0/1 executable baseline)

## Coordinate rules
- Latitude must be between -90 and 90.
- Longitude must be between -180 and 180.
- India-focused assets should generally fall within expected national bounds unless explicitly tagged as cross-border.

## Capacity and technical sanity
- Generation capacities must be positive and plausible by technology class.
- Transmission voltage class must be in approved nominal values set.
- Pipeline diameter/throughput combinations outside known engineering envelopes are flagged.

## Temporal consistency
- `commissioning_date` cannot be later than `retirement_date`.
- `expected_cod` cannot be before public announcement where both are present.
- Relationship validity windows cannot invert (`valid_to < valid_from`).

## Relationship integrity
- No self-loop for supply or offtake dependency unless explicitly whitelisted.
- Dependency edges must reference valid assets.
- Confidence score below threshold triggers manual review queue.

## Provenance requirements
- Every inserted/updated asset row must carry at least one source reference.
- `last_verified_at` required for confidence score >= 0.8.

## Required ETL output metrics
- records_in, records_out, dedupe_count, unresolved_entities, qa_error_count, qa_warning_count.
