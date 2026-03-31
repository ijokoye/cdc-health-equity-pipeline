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

## SVI Ingestion vs PLACES Ingestion

- Both ingestion steps follow the same extract → transform → load structure for consistency in the pipeline.
- PLACES ingestion primarily standardizes column names, while SVI ingestion additionally normalizes the join key (`fips`) to a 5-digit string.
- SVI data has a simpler grain (one row per county), whereas PLACES contains multi-dimensional health measurements.
- SVI ingestion focuses on preparing a clean joinable dimension (`dim_svi`), while PLACES ingestion feeds both dimensions and the fact table.


## Pipeline Overview

### Data Ingestion
This pipeline ingests two public health datasets:
- CDC PLACES (county-level health outcomes)
- CDC/ATSDR Social Vulnerability Index (SVI)

Each dataset is loaded into Postgres staging tables:
- `stg_places`
- `stg_svi`

During ingestion, column names are standardized and key fields such as FIPS codes are normalized to ensure consistency.

---

### Staging Layer
The staging tables store raw, minimally transformed data.

They serve as the foundation for the pipeline and preserve source data while enabling downstream transformations.

---

### Transformation Layer (Star Schema)
A transformation script builds an analytical warehouse using a star schema:

- Dimensions:
  - `dim_location`
  - `dim_measure`
  - `dim_svi`

- Fact table:
  - `fact_health_measure`

A cleaned view (`stg_places_cleaned`) standardizes PLACES data and ensures consistent join keys (e.g., 5-digit `location_id`).

The fact table captures health outcomes at the grain:
`location_id × year × measure_id × data_value_type_id`

The SVI dataset is joined through `location_id` to enrich health data with vulnerability metrics.

---

### Validation
Validation checks ensure:
- No duplicate fact records at the defined grain
- All fact records reference valid dimension keys
- Only valid geographic entities (counties) are included

These checks ensure the integrity and reliability of the warehouse.

---

### Analytical Insights
The warehouse supports analytical queries that explore relationships between health outcomes and social vulnerability.

Example insights include:
- Comparing obesity rates across SVI vulnerability buckets
- Identifying counties with both high vulnerability and poor health outcomes
- Analyzing clusters of chronic conditions (e.g., obesity, diabetes, hypertension) in high-risk regions

These analyses help reveal patterns between public health outcomes and social determinants of health.