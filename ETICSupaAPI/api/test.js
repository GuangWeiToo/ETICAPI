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