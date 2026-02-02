const express = require("express");
const deviceController = require("../controllers/device.Controller");
const auth = require("../middlewares/auth");
const {
  uploadSingle,
  uploadToCloudinary,
} = require("../middlewares/upload.Cloudinary");

const router = express.Router();

router.get("/", deviceController.getActiveDevices);
router.get("/best-sellers", deviceController.getBestSellers);
router.get("/offers", deviceController.getDeviceOffers);
router.get("/featured", deviceController.getFeaturedDevices);

// router.use(auth.protect, auth.restrictTo("admin"));

router.get("/admin", auth.protect, auth.restrictTo("admin"), deviceController.getAllDevicesAdmin);
router.get("/id/:id", auth.protect, auth.restrictTo("admin"), deviceController.getDeviceById);

router.post(
  "/",
  auth.protect, auth.restrictTo("admin"),
  uploadSingle("photo"),
  uploadToCloudinary,
  deviceController.createDevice
);

router.patch("/:id", auth.protect, auth.restrictTo("admin"), deviceController.updateDevice);
router.patch("/:id/feature", deviceController.toggleFeaturedDevice);
router.patch("/:id/toggle-active", auth.protect, auth.restrictTo("admin"), deviceController.toggleActiveDevice);
router.delete("/:id", auth.protect, auth.restrictTo("admin"), deviceController.deleteDevice);

router.get("/:slug", deviceController.getDeviceBySlug);

module.exports = router;
