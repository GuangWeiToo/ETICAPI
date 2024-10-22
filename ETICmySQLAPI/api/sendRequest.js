const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based MySQL library
require("dotenv").config();
const validator = require('validator'); 
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

// Route to send requests
router.post("/", async (req, res) => {
    const {
        key,
        studentName,
        studentId,
        stlFileLink,
        quantity,
        requestId,
        discordID,
        place
    } = req.body;
   
    // Verify application key
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send("Invalid Key");
    }
    if (!studentName || typeof studentName !== 'string' || studentName.length > 100) {
        return res.status(400).send("Invalid student name");
    }
    if (!Number.isInteger(studentId)) {
        return res.status(400).send("Invalid student ID");
    }
    if (!validator.isURL(stlFileLink)) {
        return res.status(400).send("Invalid STL file link");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).send("Invalid quantity");
    }
    if (!validator.isUUID(requestId, 4)) {
        return res.status(400).send("Invalid request ID");
    }
    if (!discordID || typeof discordID !== 'string') {
        return res.status(400).send("Invalid Discord ID");
    }
    if (!place || typeof place !== 'string' || place.length > 100) {
        return res.status(400).send("Invalid place");
    }

    try {
        // Insert data into MySQL
        const [result] = await pool.query(
            `INSERT INTO request_log (student_name, student_id, file_link, quantity, request_id, discord_id, place)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [studentName, studentId, stlFileLink, quantity, requestId, discordID, place]
        );

        // Respond with success
        res.status(201).json({ message: "Request successfully logged", data: { id: result.insertId } });
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
