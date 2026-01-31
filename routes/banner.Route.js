const express = require("express");
const bannerController = require("../controllers/banner.Controller");
const auth = require("../middlewares/auth");
const {
  uploadSingle,
  uploadToCloudinary,
} = require("../middlewares/upload.Cloudinary");

const router = express.Router();

router.get("/", bannerController.getActiveBanners);

router.use(auth.protect, auth.restrictTo("admin"));

router.post(
  "/",
  uploadSingle("image"),
  uploadToCloudinary,
  bannerController.createBanner
);

router.patch(
  "/:id",
  uploadSingle("image"),
  uploadToCloudinary,
  bannerController.updateBanner
);

router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
