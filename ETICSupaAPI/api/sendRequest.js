const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
require("dotenv").config();
const serviceRoleKey = process.env.SUPABASE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, serviceRoleKey);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
const { verifyApplication } = require("./utility");

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
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
      return res.status(403).send(verificationResult);
    }
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
  module.exports = router;