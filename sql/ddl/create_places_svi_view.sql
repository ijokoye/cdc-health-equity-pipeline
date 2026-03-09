-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create analytics view joining PLACES and SVI
CREATE OR REPLACE VIEW analytics.places_county_2022_ageadj AS
SELECT
    LPAD(p.locationid::text, 5, '0') AS fips,
    p.year,
    p.measureid,
    p.measure,
    p.category,
    p.data_value_type,
    p.data_value,
    p.low_confidence_limit,
    p.high_confidence_limit,
    p.stateabbr,
    p.statedesc,
    p.locationname,

    -- SVI columns
    s.fips AS svi_fips,
    s.state,
    s.county,
    s.e_totpop,
    s.rpl_themes

FROM stg_places p
LEFT JOIN stg_svi s
  ON LPAD(p.locationid::text, 5, '0') = s.fips
WHERE p.stateabbr <> 'US'
AND p.data_value_type = 'Age-adjusted prevalence';