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

// Route to update progress
router.post("/", async (req, res) => {
    const { key, column, msg, request_id } = req.body; // Use req.body for POST parameters

    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send("Invalid Key");
    }
    if (typeof msg !== 'string' || msg.length > 255) {
        return res.status(400).send("Invalid message");
    }
    
    if (!Number.isInteger(request_id)) {
        return res.status(400).send("Invalid request ID");
    }    

    const allowedColumns = ["progress", "pick_up_location"];
    
    if (!allowedColumns.includes(column)) {
        return res.status(400).send("Invalid column name or not allowed");
    }

    try {
        // Update the specified column in the 'progress' table
        const [result] = await pool.query(
            `UPDATE progress 
             SET ?? = ? 
             WHERE request_id = ?`,
            [column, msg, request_id]
        );

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).send("No progress found for the given request ID");
        }

        // Respond with success
        res.status(200).json({ message: "Progress updated successfully" });
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
