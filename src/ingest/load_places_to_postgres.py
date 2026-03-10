import pandas as pd
from sqlalchemy import create_engine

CSV_PATH = "/Users/ijeomaokoye/IdeaProjects/cdc-health-equity-pipeline/data/raw/PLACES__Local_Data_for_Better_Health,_County_Data_2024_release_20260223.csv"

DB_NAME = "health_equity"
TABLE_NAME = "stg_places"

def clean_cols(cols):
    return (
        cols.str.strip()
            .str.lower()
            .str.replace(r"[^\w]+", "_", regex=True)
            .str.replace(r"_+", "_", regex=True)
            .str.strip("_")
    )

def main():
    df = pd.read_csv(CSV_PATH, low_memory=False)
    df.columns = clean_cols(df.columns)

    engine = create_engine(
        f"postgresql+psycopg2://ijeomaokoye@localhost:5432/{DB_NAME}"
    )

    df.to_sql(TABLE_NAME, engine, if_exists="replace", index=False, chunksize=5000, method="multi")

    print("Loaded rows:", len(df))
    print("Loaded cols:", len(df.columns))

if __name__ == "__main__":
    main()