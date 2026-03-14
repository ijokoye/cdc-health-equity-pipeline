INSERT INTO analytics.fact_health_measure (
    location_id,
    year,
    measure_id,	
    data_value_type_id,
    data_value,
    low_confidence_limit,
    high_confidence_limit,
    total_population,
    total_pop_18_plus
)

SELECT 
    location_id,
    year,
    measure_id,	
    data_value_type_id,
    data_value,
    low_confidence_limit,
    high_confidence_limit,
    REPLACE(total_population, ',', '')::INT,
    REPLACE(total_pop_18_plus, ',', '')::INT

FROM analytics.stg_places_cleaned
WHERE state_abbr <> 'US';