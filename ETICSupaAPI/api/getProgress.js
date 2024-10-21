const express = require('express');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const router = express.Router();
const { verifyApplication } = require("./utility");

// Route to get progress
router.get("/", async (req, res) => {
    const { key, request_id } = req.query;

    // Verify the application key
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send("Invalid Key");
    }

    try {
        // Fetch data from Supabase
        const { data, error } = await supabase
            .from("progress")
            .select("*")
            .eq("request_id", request_id);

        // Handle SQL query error
        if (error) {
            return res.status(500).send("Error in SQL query");
        }

        // Return the result after the SQL request finishes
        res.status(200).json(data);
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;