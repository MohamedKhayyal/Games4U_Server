const express = require("express");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload.Cloudinary");
const userController = require("../controllers/user.Controller");

const router = express.Router();

router.patch(
  "/me",
  auth.protect,
  upload.uploadSingle("photo"),
  upload.uploadToCloudinary,
  userController.updateMe
);

router.get("/me", auth.protect, userController.getMe);

router.get(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  userController.getAllUsers
);

router.patch(
  "/:id/toggle-admin",
  auth.protect,
  auth.restrictTo("admin"),
  userController.toggleAdminRole
);

module.exports = router;
