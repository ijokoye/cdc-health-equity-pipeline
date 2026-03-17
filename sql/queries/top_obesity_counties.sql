SELECT
l.location_name,
l.state_abbr,
m.measure,
f.year,
f.data_value,
f.low_confidence_limit,
f.high_confidence_limit
FROM analytics.fact_health_measure f
JOIN analytics.dim_location l
ON f.location_id = l.location_id
JOIN analytics.dim_measure m
ON f.measure_id = m.measure_id
WHERE m.measure = 'Obesity among adults'
AND f.data_value_type_id = 'AgeAdjPrv'
ORDER BY data_value DESC
LIMIT 20;