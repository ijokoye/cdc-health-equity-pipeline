import pandas as pd
from sqlalchemy import create_engine

CSV = "/Users/ijeomaokoye/IdeaProjects/cdc-health-equity-pipeline/data/raw/SVI_2022_US_county (1).csv"

DB_NAME = "health_equity"
TABLE_NAME = "stg_svi"


def clean_cols(cols):
    return (
        cols.str.strip()
            .str.lower()
            .str.replace(r"[^\w]+", "_", regex=True)
            .str.replace(r"_+", "_", regex=True)
            .str.strip("_")
    )


def main():
    df = pd.read_csv(CSV, dtype=str, low_memory=False)
    df.columns = clean_cols(df.columns)

    df["fips"] = df["fips"].astype(str).str.zfill(5)

    engine = create_engine(
        f"postgresql+psycopg2://ijeomaokoye@localhost:5432/{DB_NAME}"
    )

    df.to_sql(
        TABLE_NAME,
        engine,
        if_exists="replace",
        index=False,
        chunksize=5000,
        method="multi"
    )

    print("Loaded SVI table successfully")
    print(df.columns)


if __name__ == "__main__":
    main()