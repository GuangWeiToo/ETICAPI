const express = require('express');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const router = express.Router();
const { verifyApplication } = require("./utility");

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
        // Insert data into Supabase
        const { data, error } = await supabase
            .from("request_log")
            .insert({
                student_name: studentName,
                student_id: studentId,
                file_link: stlFileLink,
                quantity: quantity,
                request_id: requestId,
                discord_id: discordID,
                place:place
            });

        // Handle SQL insert error
        if (error) {
            console.log(error);
            return res.status(500).send("Error inserting into the database");
        }

        // Respond with success
        res.status(201).json({ message: "Request successfully logged", data });
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;