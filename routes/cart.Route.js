const express = require("express");
const cartController = require("../controllers/cart.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/items", auth.protect, cartController.addToCart);
router.post("/items/remove", auth.protect, cartController.removeFromCart);
router.get("/me", auth.protect, cartController.getMyCart);

module.exports = router;
