const express = require("express");
const upload = require("../middlewares/upload.Cloudinary");
const auth = require("../middlewares/auth");
const userController = require("../controllers/user.Controller");
const router = express.Router();

router.patch(
  "/me",
  auth.protect,
  upload.uploadSingle("photo"),
  upload.uploadToCloudinary,
  userController.updateMe,
);

router.get("/me", auth.protect, userController.getMe);

module.exports = router;
