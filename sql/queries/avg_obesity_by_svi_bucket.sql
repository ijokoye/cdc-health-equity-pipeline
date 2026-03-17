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