# CDC Health Equity Pipeline

An end-to-end data pipeline that analyzes the relationship between social vulnerability and health outcomes across U.S. counties using CDC public datasets.

Raw CDC data is ingested into PostgreSQL, transformed into a star-schema data warehouse, and surfaced through a REST API and interactive React dashboard.

---

## Overview & Motivation

### What this project is

This project is a full-stack data engineering system built around a public health question: **do people in socially vulnerable communities experience worse health outcomes?**

It combines two CDC datasets — PLACES (county-level health outcome prevalence) and the Social Vulnerability Index (SVI) — and builds the infrastructure to answer that question at scale. The pipeline handles everything from raw CSV ingestion through a validated, queryable warehouse, a REST API, and an interactive dashboard. The goal was to build something production-shaped: not just a notebook, but a system with clear separation between ingestion, transformation, validation, serving, and visualization.

### Why it matters

Health disparities in the U.S. are well-documented but often opaque at the local level. The CDC's SVI captures the structural factors that shape health — income, housing, transportation access, minority status — and PLACES captures the resulting outcomes. Joining these two datasets reveals where vulnerability and poor health outcomes cluster together, which is exactly the kind of signal public health officials need to prioritize resources.

A county with high obesity rates might just have poor eating habits. A county with high obesity *and* an SVI of 0.85 is likely facing a combination of poverty, lack of healthcare access, food deserts, and environmental stressors. This pipeline is designed to surface that distinction.

### Design decisions

**Staging layer before the warehouse**  
Raw CDC data arrives with inconsistent column names, aggregate rows (e.g., a "US" record that isn't a county), and mismatched FIPS formats. The staging tables (`stg_places`, `stg_svi`) absorb that messiness so the transformation step can operate on clean, predictable inputs rather than trying to clean and model in one pass.

**Star schema over a flat table**  
A single denormalized table would have been faster to build, but a star schema (`dim_location`, `dim_measure`, `dim_svi`, `fact_health_measure`) makes the analysis layer more flexible. Adding a new health measure or joining a new dimension doesn't require restructuring the fact table — it's a new row in `dim_measure`. The grain is explicit: one row per county × year × health measure.

**Airflow for orchestration**  
The four pipeline stages (ingest places → ingest SVI → transform → validate) have a clear dependency order. Airflow makes those dependencies explicit, gives each step its own observable task, and makes it easy to rerun a failed stage without re-running the whole pipeline. Using `schedule=None` keeps it manually triggered for now, which is appropriate for a batch pipeline running on static CDC release data.

**Validation as a pipeline stage**  
Rather than validating inline inside the transform scripts, validation runs as its own DAG task after the warehouse is built. This means a failed validation fails the pipeline visibly in Airflow without silently producing bad data downstream.

**Node.js API between the warehouse and the dashboard**  
Exposing raw database access to the frontend would tightly couple the UI to the schema. The Express API acts as a contract layer — it translates warehouse queries into stable JSON shapes the dashboard can depend on. Each endpoint corresponds to a specific analytical question, which also made it easy to test the queries independently in `sql/queries/` before wiring them up.

**React + Recharts for the frontend**  
The dashboard is intentionally lightweight — no state management library, no router, no backend-for-frontend. It's a read-only view of the warehouse. Recharts integrates cleanly with React's data flow and handles both the bar chart aggregation and the scatter plot without requiring a separate charting backend.

---

## Architecture

```
CDC PLACES CSV ──┐
                 ├──► Python Ingest ──► PostgreSQL Staging ──► Star Schema Warehouse ──► Node.js API ──► React Dashboard
CDC SVI CSV ─────┘
              (Apache Airflow orchestration)
```

**4-stage Airflow DAG:**
```
ingest_places → ingest_svi → transform_warehouse → validate_warehouse
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | Apache Airflow |
| Ingestion | Python, pandas, SQLAlchemy |
| Storage | PostgreSQL |
| Transformation | SQL (star schema) |
| API | Node.js, Express |
| Frontend | React 19, Vite, Recharts |

---

## Data Sources

| Dataset | Description |
|---|---|
| CDC PLACES | County-level health outcome prevalence (obesity, diabetes, hypertension, coronary heart disease) |
| CDC Social Vulnerability Index (SVI) | Composite score measuring community vulnerability across socioeconomic and environmental dimensions |

---

## Data Model

The warehouse uses a star schema under the `analytics` schema in PostgreSQL.

```
fact_health_measure (grain: county × year × health measure)
 ├── location_id ──► dim_location  (county name, state abbreviation, FIPS code)
 ├── measure_id  ──► dim_measure   (health outcome label)
 └── location_id ──► dim_svi       (SVI overall score)
```

**Staging tables:** `stg_places`, `stg_svi`  
**Dimensions:** `dim_location`, `dim_measure`, `dim_svi`  
**Fact:** `fact_health_measure`

DDL and load scripts are in [`sql/ddl/`](sql/ddl/). Transformation logic is in [`sql/transform/transform_warehouse.sql`](sql/transform/transform_warehouse.sql).

---

## API Endpoints

The REST API is built with Node.js and Express and queries the warehouse directly.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health-data` | Top 20 counties ranked by SVI and age-adjusted obesity rate |
| `GET` | `/obesity-by-svi` | Average obesity rate grouped by vulnerability tier (Low / Medium / High) |
| `GET` | `/svi-vs-outcome` | Average health outcome per county ordered by SVI (used for scatter plot correlation) |

---

## Dashboard

Built with React + Vite + Recharts. Connects to the local API and renders:

- **Metric cards** — counties shown, unique states represented, avg obesity rate, avg SVI, high-risk county count (SVI ≥ 0.8 and obesity ≥ 40%)
- **Bar chart** — average obesity rate by vulnerability tier
- **Scatter plot** — SVI score vs. average health outcome across all counties
- **Filterable table** — county-level data filterable by state abbreviation

---

## Running Locally

### Prerequisites

- Python 3.12
- Node.js 18+
- PostgreSQL running locally with a `health_equity` database

### 1. Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Airflow environment

```bash
python3.12 -m venv .airflow-venv
source .airflow-venv/bin/activate

pip install "apache-airflow==3.1.8" \
  --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.8/constraints-3.12.txt"
```

### 3. Configure and start Airflow

```bash
export AIRFLOW_HOME="$PWD/.airflow-home"
export AIRFLOW__CORE__DAGS_FOLDER="$PWD/dags"

airflow db migrate
airflow standalone
```

Open the Airflow UI at `http://localhost:8080` and trigger the `health_equity_pipeline` DAG.

### 4. API server

```bash
cd api
npm install
node server.js
# Runs at http://localhost:3000
```

### 5. React dashboard

```bash
cd dashboard
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## Key Insights

Analysis queries in [`sql/analysis/health_equity_insights.sql`](sql/analysis/health_equity_insights.sql) surface:

- Counties in the **high-vulnerability tier (SVI ≥ 0.66)** show measurably higher average obesity rates than low-vulnerability counties
- **High-SVI counties** frequently carry the burden of multiple chronic conditions simultaneously (obesity, diabetes, hypertension, heart disease)
- The scatter plot reveals a **positive correlation** between SVI score and average health outcome burden at the county level

---

## Project Structure

```
.
├── dags/                   # Airflow DAG definition
├── src/
│   └── ingest/             # Python ingestion scripts (PLACES and SVI)
├── sql/
│   ├── ddl/                # Table creation and warehouse loading scripts
│   ├── transform/          # Staging → warehouse transformation
│   ├── queries/            # Analysis and validation queries
│   └── analysis/           # Insight queries
├── api/                    # Node.js + Express REST API
├── dashboard/              # React + Vite frontend
├── notebooks/              # Exploratory data analysis (Jupyter)
└── docs/                   # Pipeline design and data modeling notes
```
