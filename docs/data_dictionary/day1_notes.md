<!-- Fill it with: -->
    -    Dataset name + date/version (from source)
    -    Row count + column count
    -   What’s the grain? (county? census tract? state?)
    -    What fields look like join keys? (FIPS codes, GEOID, state/county)
    -    Any obvious issues: duplicates, missing key fields, weird encodings


## Dataset

## CDC PLACES — County Data

## Grain
locationid × year × measureid × datavaluetypeid

## Key Geography Column
locationid

## Meaning

locationid represents the county FIPS code
Example:
59
27011
39113

## Join Candidate

SVI dataset uses:
FIPS

Therefore:
stg_places.locationid = svi.fips

Potential join key:
county_fips