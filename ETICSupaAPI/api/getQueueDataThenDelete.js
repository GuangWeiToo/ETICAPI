const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
require("dotenv").config();
const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
const { verifyApplication } = require("./utility");

// Simple queue to hold requests
let requestQueue = [];

// Route to get queue data
app.get("/getQueueDataThenDelete", async (req,res) => {
  const userRequest = async () => {
    const {key,place} = req.query;// req.query for GET parameters and req.body for POST
    const verificationResult = verifyApplication(key);  // Verify key
    if (verificationResult) {
      return res.status(403).send(verificationResult);
    }
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
module.exports = router;