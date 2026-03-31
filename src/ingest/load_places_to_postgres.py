"""
Load raw CDC PLACES data into the Postgres staging table (stg_places).

This script represents the ingestion step of the pipeline.
"""

import pandas as pd
from sqlalchemy import create_engine, text

# Configuration
CSV_PATH = "/Users/ijeomaokoye/IdeaProjects/cdc-health-equity-pipeline/data/raw/PLACES__Local_Data_for_Better_Health,_County_Data_2024_release_20260223.csv"
DB_NAME = "health_equity"
TABLE_NAME = "stg_places"
DB_URI = f"postgresql+psycopg2://ijeomaokoye@localhost:5432/{DB_NAME}"


def clean_cols(cols):
    """Standardize column names to lowercase snake_case."""
    return (
        cols.str.strip()
            .str.lower()
            .str.replace(r"[^\w]+", "_", regex=True)
            .str.replace(r"_+", "_", regex=True)
            .str.strip("_")
    )


def extract(path):
    """Extract raw PLACES data from CSV."""
    print("Extracting data...")
    df = pd.read_csv(path, low_memory=False)
    return df


def transform(df):
    """Clean and standardize the dataset."""
    print("Transforming data...")
    df.columns = clean_cols(df.columns)
    return df


def load(df, db_uri, table_name):
    """Load dataframe into Postgres staging table."""
    print("Loading data into database...")
    engine = create_engine(db_uri)

    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE TABLE {table_name};"))

    df.to_sql(
        table_name,
        engine,
        if_exists="append",
        index=False,
        chunksize=5000,
        method="multi"
    )

    print(f"Loaded {len(df)} rows into {table_name}")


def main():
    df = extract(CSV_PATH)
    df = transform(df)
    load(df, DB_URI, TABLE_NAME)


if __name__ == "__main__":
    main()


