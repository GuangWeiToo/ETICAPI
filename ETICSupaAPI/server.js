const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./api/index");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("<h1>Server is running!</h1><p>This is a simple Express server.</p>");
});

app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
