CREATE TABLE analytics.dim_measure (
    measure_id TEXT PRIMARY KEY,
    measure TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category TEXT NOT NULL,
    data_value_unit TEXT
);