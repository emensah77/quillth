const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const pool = require('./db');

app.get('/dashboard/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const dashboardData = await pool.query('SELECT * FROM Dashboards WHERE name = $1', [name]);
    res.json(dashboardData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/chart/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { start, end, bucketSize } = req.query;

        const chartDetails = await pool.query('SELECT * FROM Charts WHERE id = $1', [id]);
        if (chartDetails.rows.length === 0) {
            return res.status(404).send('Chart not found');
        }

        const chart = chartDetails.rows[0];
        
        // Determine grouping based on bucket size
        let groupBy = "DATE_TRUNC('" + bucketSize + "', date)";
        let aggregateField = `SUM(${chart.yaxisfield})`;

        // Construct the SQL query
        let chartQuery = `SELECT ${groupBy} AS grouped_date, ${aggregateField} AS total_value FROM ${chart.datefieldtable}`;
        if (start && end) {
            chartQuery += ` WHERE date BETWEEN '${start}' AND '${end}'`;
        }
        chartQuery += ` GROUP BY grouped_date ORDER BY grouped_date`;

        console.log("Executing SQL Query:", chartQuery);  // Log the query

        const chartData = await pool.query(chartQuery);
        console.log("Query result:", chartData.rows); // Log the result
        res.json({
            chartType: chart.charttype,
            data: chartData.rows,
            ...chart
        });
    } catch (err) {
        console.error("Error executing query:", err.message);
        res.status(500).send(`Server error: ${err.message}`);
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
