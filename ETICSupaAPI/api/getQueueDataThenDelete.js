const express = require('express');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const router = express.Router();
const { verifyApplication } = require("./utility");

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

        try {
            // Fetch data from Supabase
            const { data: selectedRows, error: fetchError } = await supabase
                .from("database_queue")
                .select("place")
                .contains({ place })
                .limit(5);

            // Handle SQL query error
            if (fetchError) {
                return res.status(500).send("Error in SQL query");
            }

            // If rows are found, delete them
            if (selectedRows && selectedRows.length > 0) {
                const ids = selectedRows.map(row => row.id);
                const { error: deleteError } = await supabase
                    .from("database_queue")
                    .delete()
                    .in('id', ids); // delete rows with those IDs
                
                // Handle deletion error
                if (deleteError) {
                    return res.status(500).send("Error deleting rows");
                }
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