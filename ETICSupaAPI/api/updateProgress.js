const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
require("dotenv").config();
const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);
const express = require("express");
const router = express.Router();
// Middleware to parse JSON bodies
router.use(bodyParser.json());
const { verifyApplication } = require("./utility");

// Route to update progress
router.post("/updateProgress", async (req, res) => {
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
      return res.status(403).send(verificationResult);
    }
    const { key,column,msg, request_id } = req.query; // Use req.query for GET parameters
    const allowedColumns = ["progress","pick_up_location"];
    if (!allowedColumns.includes(column)) {
      return res.status(400).send("Invalid column name or not allowed");
    }
    const userRequest = async () => {
      const { data, error } = await supabase
        .table("progress")
        .update({ [column]: msg })
        .eq("request_id", request_id)
        .execute();
      if (error) {
        return res.status(500).send("Error in SQL query");
      }
    };
    await userRequest();
  });
  module.exports = router;