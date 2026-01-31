const express = require("express");
const auth = require("../middlewares/auth");
const adminController = require("../controllers/admin.Controller");

const router = express.Router();

router.use(auth.protect, auth.restrictTo("admin"));

router.get("/stats", adminController.getAdminStats);
router.get("/orders-stats", adminController.getOrdersStats);
router.get("/best-sellers", adminController.getBestSellers);

module.exports = router;
