# Shapefile Ingestion

This directory contains the ingestion logic for raw GIS sources.

Key responsibilities:

- Discover raw shapefile assets inside `datasets/raw/india`.
- Convert shapefiles into canonical GeoJSON.
- Normalize feature properties and validate output against dataset schemas.
- Emit metadata records for source provenance.
