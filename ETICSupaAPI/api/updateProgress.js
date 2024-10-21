const express = require('express');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const router = express.Router();
const { verifyApplication } = require("./utility");

// Route to update progress
router.post("/", async (req, res) => {
    const { key, column, msg, request_id } = req.body; // Use req.body for POST parameters

    const verificationResult = verifyApplication(key);
    if (verificationResult) {
        return res.status(403).send("Invalid Key");
    }

    const allowedColumns = ["progress", "pick_up_location"];
    if (!allowedColumns.includes(column)) {
        return res.status(400).send("Invalid column name or not allowed");
    }

    try {
        // Update the specified column in the 'progress_table'
        const { data, error } = await supabase
            .from("progress_table") // Ensure the table name is correct
            .update({ [column]: msg })
            .eq("request_id", request_id);

        // Handle SQL update error
        if (error) {
            return res.status(500).send("Error updating progress");
        }

        // Check if data was updated
        if (data.length === 0) {
            return res.status(404).send("No progress found for the given request ID");
        }

        // Respond with success
        res.status(200).json({ message: "Progress updated successfully", data });
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;