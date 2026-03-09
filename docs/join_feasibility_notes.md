    •    Datasets: PLACES County (CDC), SVI County (CDC/ATSDR)
    •    Join key: LPAD(stg_places.locationid::text, 5, '0') = stg_svi.fips
    •    Coverage: only 1 unmatched PLACES FIPS (00059, stateabbr='US') → national aggregate, excluded
    •    Grain alignment: SVI grain = fips; PLACES grain = locationid × year × measureid × data_value_type
    •    Decision: filter PLACES to stateabbr <> 'US' and data_value_type='Age-adjusted prevalence' to achieve unique grain fips × year × measureid
    •    Output artifact: analytics.places_county_2022_ageadj view