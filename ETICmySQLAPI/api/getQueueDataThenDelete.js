const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based MySQL library
require("dotenv").config();

const router = express.Router();
const { verifyApplication } = require("./utility");

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Simple queue to hold requests
let requestQueue = [];

// Route to get queue data and delete selected rows
router.get("/", async (req, res) => {
    const userRequest = async () => {
        const { key, place } = req.query; // req.query for GET parameters

        // Verify application key
        const verificationResult = verifyApplication(key);
        if (verificationResult) {
            return res.status(403).send("Invalid Key");
        }
        
        if (typeof place !== 'string' || !isValidPlace(place)) {
            return res.status(400).send("Invalid input");
        }

        try {
            // Fetch data from MySQL
            const [selectedRows] = await pool.query(
                "SELECT * FROM database_queue WHERE place = ? LIMIT 5",
                [place]
            );

            // If rows are found, delete them
            if (selectedRows.length > 0) {
                const ids = selectedRows.map(row => row.id);
                await pool.query(
                    "DELETE FROM database_queue WHERE id IN (?)",
                    [ids]
                );
            }

            // Serve the result after the SQL request finishes
            res.status(200).json(selectedRows);
        } catch (err) {
            console.error("An error occurred:", err);
            res.status(500).send("Internal Server Error");
        }

        // Remove the current request from the queue and check for the next one
        requestQueue.shift();
        if (requestQueue.length > 0) {
            requestQueue[0](); // Start the next request
        }
    };

    // Add the request to the queue
    requestQueue.push(userRequest);

    // If this is the only request in the queue, execute it immediately
    if (requestQueue.length === 1) {
        userRequest();
    }
});

module.exports = router;
