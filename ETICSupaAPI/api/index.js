const express = require("express");
const getProgressRoute = require("./getProgress");
const sendRequestRoute = require("./sendRequest");
const updateProgressRoute = require("./updateProgress");
const getQueue=require("./getQueueDataThenDelete");
const test=require("./test");
const utility=require("./utility")

const router = express.Router();

// Mount the routes
router.use("/getProgress", getProgressRoute);
router.use("/sendRequest", sendRequestRoute);
router.use("/updateProgress", updateProgressRoute);
router.use("/getQueueDataThenDelete", getQueue);
router.use("/test", test);
router.use("/utility", utility);

module.exports = router;