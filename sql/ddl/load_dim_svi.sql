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

FROM stg_svi s
JOIN analytics.dim_location d
ON s.fips = d.location_id;
