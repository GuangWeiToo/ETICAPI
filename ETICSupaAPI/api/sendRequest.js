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
    } = req.body;

    // Verify application key
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send(verificationResult+"Invalid Key");
    }

    try {
        // Insert data into Supabase
        const { data, error } = await supabase
            .from("request_log")
            .insert([{
                student_name: studentName,
                student_id: studentId,
                file_link: stlFileLink,
                quantity: quantity,
                request_id: requestId,
                discord_id: discordID,
            }]);

        // Handle SQL insert error
        if (error) {
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