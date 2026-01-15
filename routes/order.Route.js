const express = require("express");
const orderController = require("../controllers/order.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/", auth.protect, orderController.createOrder);

router.get("/my-orders", auth.protect, orderController.getMyOrders);

router.get(
  "/admin",
  auth.protect,
  auth.restrictTo("admin"),
  orderController.getAllOrders
);

module.exports = router;
