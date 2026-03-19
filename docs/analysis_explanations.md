# Health Equity Analysis Explanations

## High-SVI Counties with Multiple Poor Health Outcomes

- This query identifies counties with high overall vulnerability and compares them across 4 different chronic health measures including: obesity, high blood pressure, diabetes and coronary heart disease.
- It joins the fact table with the location, measure, and SVI dimensions so the results combine health outcome values with county-level vulnerability context.
- It is filtered on age adjusted prevalence to ensure consistency across view.
- It groups the result by counties and calculates the average burden across multiple health measures so we can clearly see counties that are facing compounded health issues.
- The query helps identify counties that may need more attention because they show both high social vulnerability and multiple elevated health risks.