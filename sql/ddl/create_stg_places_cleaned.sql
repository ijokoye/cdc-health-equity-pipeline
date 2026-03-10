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
    locationid AS location_id,
    categoryid AS category_id,
    measureid AS measure_id,
    datavaluetypeid AS data_value_type_id,
    short_question_text,
    geolocation
FROM stg_places;