const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();
// Middleware to parse JSON bodies
router.use(bodyParser.json());


// Test Route
router.get("/", (req, res) => {
    return res.send("Works");
});

module.exports = router;


/**
 * app.use(bodyParser.json());
const { verifyApplication } = require("./utility");

 * app.get("/test", async (req, res) => {
    const {key} = req.query;
    const verificationResult = verifyApplication(key);
    if (verificationResult) {
      return res.status(403).send(verificationResult);
    }
    const userRequest = async () => {
      const {data} = "Connected and Works"
  
      if (error) {
        return res.status(500).send("Error in API VERCEL");
      }
  
      // Serve the result after the SQL request finishes
      res.status(200).json(data);
      return data;
    };
    await userRequest();
  });

 */