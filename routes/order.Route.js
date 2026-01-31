const express = require("express");
const orderController = require("../controllers/order.Controller");
const auth = require("../middlewares/auth");
const { apiLimiter } = require("../middlewares/rate.Limiters");

const router = express.Router();

router.use(auth.protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);

router.get(
  "/",
  auth.restrictTo("admin"),
  orderController.getAllOrders
);

router.patch(
  "/:id/status",
  auth.restrictTo("admin"),
  orderController.updateOrderStatus
);

module.exports = router;
