CREATE TABLE analytics.dim_svi (
    location_id TEXT PRIMARY KEY,
    svi_overall FLOAT,
    svi_socioeconomic FLOAT,
    svi_household FLOAT,
    svi_minority FLOAT,
    svi_housing_transport FLOAT
);