# Pipeline Design

## Goal
Move raw CDC PLACES and SVI data into a cleaned analytical warehouse that supports validation and health equity analysis.

## Pipeline Flow

1. Ingest raw PLACES data into the staging table `stg_places`.
   - Current script: `src/ingest/load_places_to_postgres.py`

2. Ingest raw SVI data into the staging table `stg_svi`.
   - Current script: `src/ingest/load_svi_to_postgres.py`

3. Clean and standardize PLACES fields in the cleaned view `analytics.stg_places_cleaned`.
   - Current SQL file: `sql/ddl/create_stg_places_cleaned.sql`

4. Confirm SVI grain, key columns, and warehouse join key.
   - SVI grain = one row per county
   - Join key = `FIPS` → `location_id`
   - Year is implicit from the 2022 dataset version

5. Build warehouse dimension tables.
   - `analytics.dim_location`
   - `analytics.dim_measure`
   - `analytics.dim_svi`

6. Build the central fact table.
   - `analytics.fact_health_measure`

7. Run warehouse validation checks.
   - Current SQL file: `sql/queries/warehouse_validation.sql`

8. Run analytical SQL queries.
   - Current SQL file: `sql/analysis/health_equity_insights.sql`

## Dependency Order

- `stg_places` must exist before `analytics.stg_places_cleaned`.
- `stg_svi` must exist before `dim_svi`.
- `dim_location` and `dim_measure` must exist before `fact_health_measure`.
- `dim_location` should exist before `dim_svi` because `dim_svi.location_id` references it.
- Validation should happen after all warehouse tables are populated.
- Analysis queries should run after validation passes.

## Why This Matters

This pipeline order ensures that:
- raw source data is preserved,
- transformations are reproducible,
- warehouse tables are built in the correct dependency order,
- and downstream analytical queries can be trusted.

## Ingestion Step (PLACES)

- Extracts raw CDC PLACES CSV data from local storage
- Transforms column names into standardized snake_case format
- Loads the cleaned data into the Postgres staging table (`stg_places`)
- Structured into extract → transform → load stages for modular pipeline design