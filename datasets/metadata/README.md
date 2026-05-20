# Dataset Metadata Tracking

This directory contains metadata artifacts used to track dataset provenance, schema, source details, and processing lineage for datasets ingested into this repository.

Structure:

- `catalog.yml` — a top-level dataset registry that lists dataset families, versions, licenses, and ingestion status.
- `sources/` — dataset-specific provenance and source metadata definitions.
- `schemas/` — dataset schema definitions and field contracts for transformed GeoJSON outputs.

Goals:

- Keep raw data sources separate from processed outputs.
- Record dataset license, origin, last-updated date, and processing notes.
- Provide machine-readable metadata for future automation and validation.
