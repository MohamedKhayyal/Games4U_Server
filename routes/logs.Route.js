const express = require("express");
const auth = require("../middlewares/auth");
const logsController = require("../controllers/logs.Controller");

const router = express.Router();

router.get(
    "/",
    auth.protect,
    auth.restrictTo("admin"),
    logsController.getLogs
);

router.get(
    "/download",
    auth.protect,
    auth.restrictTo("admin"),
    logsController.downloadLog
);

module.exports = router;
