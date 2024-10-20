app.use(bodyParser.json());
const { verifyApplication } = require("./utility");

// test Route
app.get("/test", async (req, res) => {
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

  module.exports = router;