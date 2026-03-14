CREATE TABLE analytics.fact_health_measure (
    location_id TEXT NOT NULL,
    year INT NOT NULL,
    measure_id TEXT NOT NULL,
    data_value_type_id TEXT NOT NULL,

    data_value FLOAT,
    low_confidence_limit FLOAT,
    high_confidence_limit FLOAT,
    total_population INT,
    total_pop_18_plus INT,

    PRIMARY KEY (location_id, year, measure_id, data_value_type_id)
);

