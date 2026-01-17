const express = require("express");
const authController = require("../controllers/auth.Controller");
const { uploadSingle, resize } = require("../middlewares/upload");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", uploadSingle("photo"), resize, authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post(
  "/create-admin",
  auth.protect,
  auth.restrictTo("admin"),
  authController.createAdmin,
);

module.exports = router;
