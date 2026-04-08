const express = require('express');     // import Express framework
const { Pool } = require('pg');         // import Postgres connection pool

const app = express();                  // create Express app/server object
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
            SELECT location_name, state_abbr
            FROM analytics.dim_location
            LIMIT 5;
        `);

        // send returned rows back as JSON
        res.json(result.rows);
    } catch (err) {
        // if something goes wrong, log it and send error response
        console.error(err);
        res.status(500).send("Server error");
    }
});

// after all routes/config are defined, start listening for requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


