const express = require("express");
const bodyParser = require('body-parser');

const getProgressRoute = require("./getProgress");
const sendRequestRoute = require("./sendRequest");
const updateProgressRoute = require("./updateProgress");
const getQueue = require("./getQueueDataThenDelete");
const test = require("./test");

const router = express.Router();
router.use(bodyParser.json());

// Mount the routes
router.use("/getProgress", getProgressRoute);
router.use("/sendRequest", sendRequestRoute);
router.use("/updateProgress", updateProgressRoute);
router.use("/getQueueDataThenDelete", getQueue);
router.use("/test", test);

module.exports = router;
