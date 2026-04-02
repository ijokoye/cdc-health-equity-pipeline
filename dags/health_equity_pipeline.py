from pathlib import Path
import sys


from airflow import DAG
from datetime import datetime
from airflow.providers.standard.operators.python import PythonOperator

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from src.ingest.load_places_to_postgres import main as run_places_ingestion

with DAG(
    dag_id="health_equity_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    # Step 1: ingest_places
    ingest_places = PythonOperator(
    task_id="ingest_places",
    python_callable=run_places_ingestion,
)
    # Step 1: ingest_places
    # Step 2: ingest_svi
    # Step 3: transform_warehouse
    # Step 4: validation
    


