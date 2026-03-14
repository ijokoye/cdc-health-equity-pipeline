SELECT
    location_name,
    state_abbr,
    measure,
    year,
    data_value,
    data_value_type_id AS value_type,
    svi_overall

FROM analytics.fact_health_measure f
JOIN analytics.dim_location l 
    ON f.location_id = l.location_id

JOIN analytics.dim_measure m
    ON f.measure_id = m.measure_id

JOIN analytics.dim_svi s
    ON f.location_id = s.location_id

LIMIT 20;