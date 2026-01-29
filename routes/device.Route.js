const express = require("express");
const deviceController = require("../controllers/device.Controller");
const auth = require("../middlewares/auth");
const {
  uploadSingle,
  uploadToCloudinary,
} = require("../middlewares/upload.Cloudinary");

const router = express.Router();

router.get("/", deviceController.getAllDevices);
router.get("/best-sellers", deviceController.getBestSellers);
router.get("/offers", deviceController.getDeviceOffers);
router.get("/featured", deviceController.getFeaturedDevices);
router.get(
  "/id/:id",
  auth.protect,
  auth.restrictTo("admin"),
  deviceController.getDeviceById
);

router.get("/:slug", deviceController.getDeviceBySlug);

router.post(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  uploadSingle("photo"),
  uploadToCloudinary,
  deviceController.createDevice
);

router.patch(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  deviceController.updateDevice
);

router.delete(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  deviceController.deleteDevice
);

module.exports = router;
