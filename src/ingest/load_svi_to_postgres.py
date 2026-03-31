"""
Load raw CDC SVI data into the Postgres staging table (stg_svi).

This script represents the ingestion step for SVI data in the pipeline.
"""

import pandas as pd
from sqlalchemy import create_engine, text

# Configuration
CSV = "/Users/ijeomaokoye/IdeaProjects/cdc-health-equity-pipeline/data/raw/SVI_2022_US_county (1).csv"
DB_NAME = "health_equity"
TABLE_NAME = "stg_svi"
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
    """Extract raw SVI data from CSV."""
    print("Extracting SVI data...")
    df = pd.read_csv(CSV, dtype=str, low_memory=False)
    return df

def transform(df):
    """Clean and prepare SVI dataset."""
    print("Transforming SVI data...")

    # Clean column names
    df.columns = clean_cols(df.columns)

    # Ensure FIPS is a 5 digit string
    df["fips"] = df["fips"].astype(str).str.zfill(5)

    return df

def load(df, db_uri, table_name):
    print("Loading SVI data into database...")
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
    df = extract(CSV)
    df.columns = clean_cols(df.columns)
    load(df, DB_URI, TABLE_NAME)



if __name__ == "__main__":
    main()