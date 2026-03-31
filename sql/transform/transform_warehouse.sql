-- =========================================
-- Transform Warehouse
-- Build the warehouse from staging tables
-- =========================================

-- This script rebuilds the analytical warehouse from staging data.
-- Source staging tables:
--   public.stg_places
--   public.stg_svi
--
-- Warehouse objects created:
--   analytics.stg_places_cleaned (view)
--   analytics.dim_location
--   analytics.dim_measure
--   analytics.dim_svi
--   analytics.fact_health_measure


-- =========================================
-- 0. Reset warehouse objects
-- =========================================

DROP TABLE IF EXISTS analytics.fact_health_measure;
DROP TABLE IF EXISTS analytics.dim_svi;
DROP TABLE IF EXISTS analytics.dim_measure;
DROP TABLE IF EXISTS analytics.dim_location;
DROP VIEW IF EXISTS analytics.stg_places_cleaned;


-- =========================================
-- 1. Create cleaned PLACES view
-- =========================================

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.stg_places_cleaned AS
SELECT
    year,
    stateabbr AS state_abbr,
    statedesc AS state_desc,
    locationname AS location_name,
    datasource AS data_source,
    category,
    measure,
    data_value_unit,
    data_value_type,
    data_value,
    data_value_footnote_symbol,
    data_value_footnote,
    low_confidence_limit,
    high_confidence_limit,
    totalpopulation AS total_population,
    totalpop18plus AS total_pop_18_plus,
    LPAD(locationid::text, 5, '0') AS location_id,
    categoryid AS category_id,
    measureid AS measure_id,
    datavaluetypeid AS data_value_type_id,
    short_question_text,
    geolocation
FROM stg_places;


-- =========================================
-- 2. Create dimension tables
-- =========================================

CREATE TABLE analytics.dim_location (
    location_id TEXT PRIMARY KEY,
    state_abbr TEXT NOT NULL,
    location_name TEXT NOT NULL,
    geolocation TEXT
);

CREATE TABLE analytics.dim_measure (
    measure_id TEXT PRIMARY KEY,
    measure TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category TEXT NOT NULL,
    data_value_unit TEXT
);

CREATE TABLE analytics.dim_svi (
    location_id TEXT PRIMARY KEY REFERENCES analytics.dim_location(location_id),
    svi_overall FLOAT,
    svi_socioeconomic FLOAT,
    svi_household FLOAT,
    svi_minority FLOAT,
    svi_housing_transport FLOAT
);


-- =========================================
-- 3. Load dimension tables
-- =========================================

INSERT INTO analytics.dim_location (
    location_id,
    state_abbr,
    location_name,
    geolocation
)
SELECT DISTINCT
    location_id,
    state_abbr,
    location_name,
    geolocation
FROM analytics.stg_places_cleaned
WHERE state_abbr <> 'US';

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

INSERT INTO analytics.dim_svi (
    location_id,
    svi_overall,
    svi_socioeconomic,
    svi_household,
    svi_minority,
    svi_housing_transport
)
SELECT
    s.fips AS location_id,
    s.rpl_themes::FLOAT,
    s.rpl_theme1::FLOAT,
    s.rpl_theme2::FLOAT,
    s.rpl_theme3::FLOAT,
    s.rpl_theme4::FLOAT
FROM public.stg_svi s
JOIN analytics.dim_location d
    ON s.fips = d.location_id;


-- =========================================
-- 4. Create fact table
-- =========================================

CREATE TABLE analytics.fact_health_measure (
    location_id TEXT NOT NULL REFERENCES analytics.dim_location(location_id),
    year INT NOT NULL,
    measure_id TEXT NOT NULL REFERENCES analytics.dim_measure(measure_id),
    data_value_type_id TEXT NOT NULL,
    data_value FLOAT,
    low_confidence_limit FLOAT,
    high_confidence_limit FLOAT,
    total_population INT,
    total_pop_18_plus INT,
    PRIMARY KEY (location_id, year, measure_id, data_value_type_id)
);


-- =========================================
-- 5. Load fact table
-- =========================================

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