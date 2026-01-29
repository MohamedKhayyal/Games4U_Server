const express = require("express");
const auth = require("../middlewares/auth");
const adminControlle = require("../controllers/admin.Controller");

const router = express.Router();


router.get(
    "/stats",
    auth.protect,
    auth.restrictTo("admin"),
    adminControlle.getAdminStats
);
router.get(
    "/orders-stats",
    auth.protect,
    auth.restrictTo("admin"),
    adminControlle.getOrdersStats
);
router.get(
    "/best-sellers",
    auth.protect,
    auth.restrictTo("admin"),
    adminControlle.getBestSellers
);

module.exports = router;
