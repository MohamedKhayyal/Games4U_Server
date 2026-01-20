const express = require("express");
const { uploadSingle, resize } = require("../middlewares/upload");
const userController = require("../controllers/user.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.patch(
  "/me",
  auth.protect,
  uploadSingle("photo"),
  resize,
  userController.updateMe
);

router.get("/me", auth.protect, userController.getMe);

module.exports = router;
