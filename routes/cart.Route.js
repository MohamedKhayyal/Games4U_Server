const express = require("express");
const cartController = require("../controllers/cart.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.use(auth.protect);

router.post("/items", cartController.addToCart);
router.post("/items/remove", cartController.removeFromCart);
router.get("/me", cartController.getMyCart);

module.exports = router;
