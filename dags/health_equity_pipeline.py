from pathlib import Path
import sys


from airflow import DAG
from datetime import datetime
from airflow.providers.standard.operators.python import PythonOperator
# from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
import subprocess

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from src.ingest.load_places_to_postgres import main as run_places_ingestion
from src.ingest.load_svi_to_postgres import main as run_svi_ingestion

def run_transform():
    sql_file = PROJECT_ROOT / "sql" / "transform" / "transform_warehouse.sql"
    print(f"Running warehouse transform SQL: {sql_file}")

    try:
        subprocess.run(["psql", "-d", "health_equity", "-f", str(sql_file)], check=True)
    except subprocess.CalledProcessError as e:
        print("There was an error in the transform_warehouse step", e)
        raise


def run_validation():
    sql_file = PROJECT_ROOT / "sql" / "queries" / "warehouse_validation.sql"
    print(f"Running validation warehouse SQL: {sql_file}")

    try:
        subprocess.run(["psql", "-d", "health_equity", "-f", str(sql_file)], check=True)
    except subprocess.CalledProcessError as e:
        print("There was an error running the validation checks for warehouse transformation", e)
        raise



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

    # Step 2: ingest_svi
    ingest_svi = PythonOperator(
        task_id = "ingest_svi",
        python_callable=run_svi_ingestion,
    )
    # Step 3: transform_warehouse
    transform_warehouse = PythonOperator(
        task_id = "transform_warehouse",
        python_callable=run_transform,
    )
    # Step 4: validation
    validate_warehouse = PythonOperator(
        task_id = "validate_warehouse",
        python_callable=run_validation,
    )


    ingest_places >> ingest_svi >> transform_warehouse >> validate_warehouse
    


