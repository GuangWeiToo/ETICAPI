const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
require("dotenv").config();
const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
const { verifyApplication } = require("./utility");

// Route to get progress
app.get("/getProgress", async (req, res) => {

    const {key, request_id } = req.query;
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
      return res.status(403).send(verificationResult);
    }
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
  module.exports = router;