# CDC Health Equity Data Engineering

## Goal
Build a reproducible pipeline that ingests CDC datasets, cleans/standardizes them, and loads them into an analytics-ready schema (fact/dim) for equity insights.

## Repo Structure
- data/ (ignored): raw/interim/processed data
- src/: pipeline code (ingest/transform/load)
- sql/: DDL + analysis queries
- notebooks/: exploration only (keep logic in src/)
- docs/: diagrams + data dictionary
- reports/: QA checks + figures

## Day 1
- [ ] Download CDC dataset(s) into data/raw
- [ ] Inspect schema, keys, missingness, and geography fields

## Airflow Orchestration

- Set up Airflow locally in a dedicated virtual environment
- Created DAG: `health_equity_pipeline`
- Implemented ingestion task using `PythonOperator`
- Task executes PLACES ingestion script (`load_places_to_postgres.py`)
- Successfully triggered DAG runs and monitored execution via UI logs