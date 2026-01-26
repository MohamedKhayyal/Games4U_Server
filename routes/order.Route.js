const express = require("express");
const orderController = require("../controllers/order.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/", auth.protect, orderController.createOrder);

router.get("/my-orders", auth.protect, orderController.getMyOrders);

router.get("/:id", auth.protect, orderController.getOrderById);

router.get(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  orderController.getAllOrders
);

router.patch(
  "/:id/status",
  auth.protect,
  auth.restrictTo("admin"),
  orderController.updateOrderStatus
);

module.exports = router;
