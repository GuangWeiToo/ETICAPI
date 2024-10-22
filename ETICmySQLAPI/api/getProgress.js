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

// Function to validate UUID
const isValidUUID = (uuid) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

// Route to get progress
router.get("/", async (req, res) => {
    const { key, request_id } = req.query;

    // Verify the application key
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send("Invalid Key");
    }
    if (!Number.isInteger(Number(request_id)) && !isValidUUID(request_id)) {
        return res.status(400).send("Invalid request ID");
    }

    try {
        // Fetch data from MySQL
        const [data] = await pool.query(
            "SELECT * FROM progress WHERE request_id = ?",
            [request_id]
        );

        // Return the result after the SQL request finishes
        res.status(200).json(data);
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
