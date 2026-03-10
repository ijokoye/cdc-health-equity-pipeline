INSERT INTO analytics.dim_measure (
    measure_id,
    measure,
    category_id,
    category,
    data_value_unit
)

SELECT DISTINCT
    measure_id,
    measure,
    category_id,
    category,
    data_value_unit
FROM analytics.stg_places_cleaned;