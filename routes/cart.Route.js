const express = require("express");
const cartController = require("../controllers/cart.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/add", auth.protect, cartController.addToCart);
router.post("/remove", auth.protect, cartController.removeFromCart);
router.get("/me", auth.protect, cartController.getMyCart);

module.exports = router;
