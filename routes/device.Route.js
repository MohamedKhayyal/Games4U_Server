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
router.get("/:slug", deviceController.getDeviceBySlug);

router.use(auth.protect, auth.restrictTo("admin"));

router.get("/id/:id", deviceController.getDeviceById);

router.post(
  "/",
  uploadSingle("photo"),
  uploadToCloudinary,
  deviceController.createDevice
);

router.patch("/:id", deviceController.updateDevice);

router.patch("/:id/feature", deviceController.toggleFeaturedDevice);

router.delete("/:id", deviceController.deleteDevice);

module.exports = router;
