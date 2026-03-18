-- =========================================
-- HEALTH EQUITY INSIGHTS
-- =========================================

-- 1. Average obesity by SVI bucket
SELECT
    CASE
        WHEN s.svi_overall < 0.33 THEN 'Low Vulnerability'
        WHEN s.svi_overall < 0.66 THEN 'Medium Vulnerability'
        ELSE 'High Vulnerability'
    END AS vulnerability_levels,
    AVG(f.data_value) AS avg_obesity
FROM analytics.fact_health_measure f
JOIN analytics.dim_svi s
    ON f.location_id = s.location_id
JOIN analytics.dim_measure m
    ON f.measure_id = m.measure_id
WHERE m.measure = 'Obesity among adults'
AND f.data_value_type_id = 'AgeAdjPrv'
GROUP BY vulnerability_levels
ORDER BY avg_obesity DESC;


-- 2. Counties ranked by high SVI and obesity
SELECT
    l.location_name,
    l.state_abbr,
    m.measure,
    f.year,
    s.svi_overall,
    f.data_value,
    f.low_confidence_limit,
    f.high_confidence_limit
FROM analytics.fact_health_measure f
JOIN analytics.dim_location l
    ON f.location_id = l.location_id
JOIN analytics.dim_svi s
    ON f.location_id = s.location_id
JOIN analytics.dim_measure m
    ON f.measure_id = m.measure_id
WHERE m.measure = 'Obesity among adults'
AND f.data_value_type_id = 'AgeAdjPrv'
ORDER BY
    s.svi_overall DESC,
    f.data_value DESC
LIMIT 20;

-- 3. High-SVI counties with multiple poor health outcomes
-- 3. High-SVI counties with multiple poor health outcomes
SELECT
    l.location_name,
    l.state_abbr,
    s.svi_overall,
    COUNT(DISTINCT m.measure_id) AS tracked_outcomes,
    AVG(f.data_value) AS avg_health_burden
FROM analytics.fact_health_measure f
JOIN analytics.dim_location l
    ON f.location_id = l.location_id
JOIN analytics.dim_measure m
    ON f.measure_id = m.measure_id
JOIN analytics.dim_svi s
    ON f.location_id = s.location_id
WHERE m.measure IN (
    'Obesity among adults',
    'High blood pressure among adults',
    'Diagnosed diabetes among adults',
    'Coronary heart disease among adults'
)
  AND f.data_value_type_id = 'AgeAdjPrv'
  AND s.svi_overall >= 0.66
GROUP BY
    l.location_name,
    l.state_abbr,
    s.svi_overall
ORDER BY avg_health_burden DESC
LIMIT 20;