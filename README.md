# CDC Health Equity Pipeline

An end-to-end data pipeline that analyzes the relationship between social vulnerability and health outcomes across U.S. counties using CDC public datasets.

Raw CDC data is ingested into PostgreSQL, transformed into a star-schema data warehouse, and surfaced through a REST API and interactive React dashboard.

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
