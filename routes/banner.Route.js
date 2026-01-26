const express = require("express");
const bannerController = require("../controllers/banner.Controller");
const auth = require("../middlewares/auth");
const {
  uploadSingle,
  uploadToCloudinary,
} = require("../middlewares/upload.Cloudinary");

const router = express.Router();

router.get("/", bannerController.getActiveBanners);

router.post(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  uploadSingle("image"),
  uploadToCloudinary,
  bannerController.createBanner
);

router.patch(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  uploadSingle("image"),
  uploadToCloudinary,
  bannerController.updateBanner
);

router.delete(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  bannerController.deleteBanner
);

module.exports = router;
