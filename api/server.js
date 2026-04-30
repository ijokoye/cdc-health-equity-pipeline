const express = require('express');     // import Express framework
const { Pool } = require('pg');         // import Postgres connection pool
const cors = require("cors");

const app = express();                  // create Express app/server object
app.use(cors());
const PORT = 3000;                      // choose the port our API will listen on

// create a reusable connection manager to Postgres
const pool = new Pool({
    host: 'localhost',
    user: 'ijeomaokoye',
    database: 'health_equity',
    port: 5432
});

// define what happens when someone sends GET request to /health-data
app.get('/health-data', async (req, res) => {
    try {
        // send SQL query to Postgres and wait for result
        const result = await pool.query(`
            SELECT
                l.location_name,
                l.state_abbr,
                m.measure,
                f.year,
                s.svi_overall        AS svi,
                f.data_value         AS obesity,
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
        `);

        // send returned rows back as JSON
        res.json(result.rows);
    } catch (err) {
        // if something goes wrong, log it and send error response
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Returns average obesity rate grouped into three SVI vulnerability buckets.
// This query already exists in sql/queries/avg_obesity_by_svi_bucket.sql —
// we're just exposing it as an API endpoint so the dashboard can use it.
app.get('/obesity-by-svi', async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                CASE
                    WHEN s.svi_overall < 0.33 THEN 'Low Vulnerability'
                    WHEN s.svi_overall < 0.66 THEN 'Medium Vulnerability'
                    ELSE 'High Vulnerability'
                END AS vulnerability_level,
                ROUND(AVG(f.data_value)::numeric, 1) AS avg_obesity
            FROM analytics.fact_health_measure f
            JOIN analytics.dim_svi s
                ON f.location_id = s.location_id
            JOIN analytics.dim_measure m
                ON f.measure_id = m.measure_id
            WHERE m.measure = 'Obesity among adults'
              AND f.data_value_type_id = 'AgeAdjPrv'
            GROUP BY vulnerability_level
            ORDER BY avg_obesity DESC;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// define what happens when someone sends GET request to /svi-vs-outcome
app.get('/svi-vs-outcome', async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                l.location_name,
                l.state_abbr,
                s.svi_overall AS svi,
                ROUND(AVG(f.data_value)::numeric, 1)   AS avg_health_outcome
            FROM analytics.fact_health_measure f
            JOIN analytics.dim_location l  ON f.location_id = l.location_id
            JOIN analytics.dim_svi s  ON f.location_id = s.location_id
            WHERE f.data_value_type_id = 'AgeAdjPrv'
            AND f.data_value IS NOT NULL
            AND s.svi_overall IS NOT NULL
            GROUP BY l.location_name, l.state_abbr, s.svi_overall
            ORDER BY s.svi_overall;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// after all routes/config are defined, start listening for requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


