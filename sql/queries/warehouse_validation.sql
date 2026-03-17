-- =====================================
-- WAREHOUSE VALIDATION CHECKS
-- =====================================


-- 1. Duplicate fact rows
SELECT
    location_id,
    measure_id,
    year,
    data_value_type_id,
    COUNT(*) AS row_count
FROM analytics.fact_health_measure
GROUP BY
    location_id,
    measure_id,
    year,
    data_value_type_id
HAVING COUNT(*) > 1;


-- 2. Fact rows referencing missing locations
SELECT COUNT(*)
FROM analytics.fact_health_measure f
LEFT JOIN analytics.dim_location l
ON f.location_id = l.location_id
WHERE l.location_id IS NULL

-- 3. Fact rows referencing missing measures
SELECT COUNT(*)
FROM analytics.fact_health_measure f
LEFT JOIN analytics.dim_measure m
ON f.measure_id = m.measure_id
WHERE m.measure_id IS NULL;

-- 4. Fact rowsmap to svi
SELECT COUNT(*)
FROM analytics.fact_health_measure f
LEFT JOIN analytics.dim_svi s
ON f.location_id = s.location_id
WHERE s.location_id is NULL;