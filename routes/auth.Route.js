const express = require("express");
const authController = require("../controllers/auth.Controller");
const userController = require("../controllers/user.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", auth.protect, userController.getMe);

router.post(
  "/create-admin",
  auth.protect,
  auth.restrictTo("admin"),
  authController.createAdmin
);

module.exports = router;
