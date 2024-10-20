const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();
const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);
const apiKey=process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [];
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Simple queue to hold requests
let requestQueue = [];
function verifyApplication(privateKey) {
  if(!apiKey.includes(privateKey)){
    return ("Invalid Key");
  }
}
// Route to get queue data
app.get("/getQueueDataThenDelete", async (req,res) => {
  const userRequest = async () => {
    const {key,place} = req.query;// req.query for GET parameters and req.body for POST
    verifyApplication(key);
    const { data:selectedRows, error } = await supabase
      .from("database_queue")
      .select("place")
      .contains({place})
      .limit(5);
    if (selectedRows && selectedRows.length > 0) {
    const ids = selectedRows.map(row => row.id);
    const { data: deletedRows, error: deleteError } = await supabase
        .from("database_queue")
        .delete()
        .in('id', ids); // delete rows with those IDs
    }

    if (error) {
      return res.status(500).send("Error in SQL query");
    }
    // Serve the result after the SQL request finishes
    res.status(200).json(selectedRows);

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

// Route to send requests
app.post("/sendRequest", async (req, res) => {
  const {
    key,
    studentName,
    studentId,
    stlFileLink,
    quantity,
    requestId,
    discordID,
  } = req.body;
  verifyApplication(key);
  const userRequest = async () => {
    const {data, error } = await supabase.from("request_log").insert([
      {
        student_name: studentName,
        student_id: studentId,
        file_link: stlFileLink,
        quantity: quantity,
        request_id: requestId,
        discord_id: discordID,
      },
    ]);

    if (error) {
      return res.status(500).send("Error in SQL query");
    }
  };
  await userRequest();
});

// Route to get progress
app.get("/getProgress", async (req, res) => {

  const {key, request_id } = req.query;
  verifyApplication(key);
  const userRequest = async () => {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("request_id", request_id);

    if (error) {
      return res.status(500).send("Error in SQL query");
    }

    // Serve the result after the SQL request finishes
    res.status(200).json(data);
    return data;
  };
  await userRequest();
});

// Route to update progress
app.post("/updateProgress", async (req, res) => {
  verifyApplication(key);
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

// Start the server * must be changed later
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
