# CDC Health Equity Pipeline

This project builds an end-to-end data pipeline to analyze health outcomes (e.g., obesity, diabetes, hypertension) in relation to social vulnerability across U.S. counties.

The pipeline ingests CDC datasets, transforms them into a structured warehouse, and generates insights around health equity.

---

##  Data Sources

- **CDC PLACES (County Data)**
  - Health outcomes at county level (e.g., obesity, diabetes)

- **CDC Social Vulnerability Index (SVI)**
  - Measures community vulnerability based on socioeconomic and environmental factors

---

##  Pipeline Overview

The pipeline follows a standard data engineering workflow:

1. **Ingestion**
   - Load raw PLACES and SVI CSV files
   - Clean column names
   - Store data in Postgres staging tables:
     - `stg_places`
     - `stg_svi`

2. **Transformation**
   - Build a star schema warehouse:
     - `dim_location`
     - `dim_measure`
     - `dim_svi`
     - `fact_health_measure`
   - Filter and standardize data (e.g., remove US aggregate rows, enforce consistent FIPS format)

3. **Validation**
   - Ensure no duplicates
   - Ensure join consistency across datasets
   - Confirm correct grain (county × year × measure)

4. **Analysis**
   - Identify relationships between health outcomes and vulnerability
   - Example insights:
     - Obesity vs SVI trends
     - High-risk counties with multiple chronic conditions

---

## Airflow Orchestration

The pipeline is orchestrated using Apache Airflow.

Current DAG:
```text
ingest_places >> transform_warehouse


## Running the Pipeline Locally

### 1. Set up project environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install pandas sqlalchemy psycopg2-binary

### 2. Set up airflow environment

python3.12 -m venv .airflow-venv
source .airflow-venv/bin/activate

pip install "apache-airflow==3.1.8" \
  --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.8/constraints-3.12.txt"


### 3. Configure Airflow
export AIRFLOW_HOME="$PWD/.airflow-home"
export AIRFLOW__CORE__DAGS_FOLDER="$PWD/dags"

airflow db migrate
airflow standalone

### 4. Airflow UI
http://localhost:8080


### 5. API Layer
This project exposes my health equity data through a REST API builty wth Node.js and Express

#### Endpoint: GET/health-data
