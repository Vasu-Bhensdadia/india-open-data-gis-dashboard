# GIS Workflow Orchestrators

This directory contains end-to-end workflow modules that stitch together ingestion, transformation, optimization, and metadata extraction.

Workflows should:

- use reusable utilities from `scripts/data/utils/`
- maintain clear stage boundaries (ingest, validate, optimize, simplify)
- produce structured outputs in `datasets/processed/india`
- emit metadata artifacts suitable for `datasets/metadata/`
