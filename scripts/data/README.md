# GIS Data Processing Scripts

This workspace contains the reusable automation modules for dataset ingestion, transformation, optimization, and metadata extraction.

Purpose:

- Keep dataset processing logic isolated from frontend and backend application code.
- Provide reusable GIS utilities for geometry validation, coordinate normalization, and metadata extraction.
- Enable repeatable workflows for shapefile conversion and GeoJSON optimization.

Directory layout:

- `ingest/` — raw dataset ingestion and shapefile-to-GeoJSON conversion helpers.
- `optimization/` — GeoJSON optimization and geometry simplification helpers.
- `utils/` — shared GIS helpers and metadata utilities.
- `workflows/` — orchestrators for end-to-end conversion and optimization pipelines.
