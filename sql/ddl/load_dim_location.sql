INSERT INTO analytics.dim_location (
    location_id,
    state_abbr,
    location_name,
    geolocation 
)
SELECT DISTINCT
    LPAD(location_id::text, 5, '0') AS location_id,
    state_abbr,
    location_name,
    geolocation
FROM analytics.stg_places_cleaned
WHERE state_abbr <> 'US';