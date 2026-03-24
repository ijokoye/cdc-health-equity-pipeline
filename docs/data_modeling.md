# Data Modeling Notes

## 1. Dataset Overview

### CDC PLACES — County Data

- Grain: `locationid × year × measureid × datavaluetypeid`
- Geography key: `locationid`
- Meaning:
  - Represents county FIPS code
  - Examples: 59, 27011, 39113

---

## 2. Join Feasibility (PLACES ↔ SVI)

- Datasets:
  - CDC PLACES County
  - CDC/ATSDR SVI County

- Join key:
  - `LPAD(stg_places.locationid::text, 5, '0') = stg_svi.fips`

- Coverage:
  - Only 1 unmatched PLACES FIPS:
    - `00059` (stateabbr = 'US')
    - Represents national aggregate → excluded

- Grain alignment:
  - SVI grain = `fips`
  - PLACES grain = `locationid × year × measureid × data_value_type`

---

## 3. Modeling Decisions

- Filter PLACES:
  - `stateabbr <> 'US'`
  - `data_value_type = 'Age-adjusted prevalence'`

- Resulting grain:
  - `fips × year × measureid`

- Decision:
  - Maintain PLACES and SVI as separate tables
  - Join them through `location_id` at query time

---

## 4. Key Design Insights

- `location_id` is the shared key across:
  - `dim_location`
  - `fact_health_measure`
  - `dim_svi`

- SVI is a **county-level attribute**
  → joins naturally at the location level

- PLACES is a **multi-dimensional fact dataset**
  → requires filtering to achieve clean analytical grain