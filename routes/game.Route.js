const express = require("express");
const gameController = require("../controllers/game.Controller");
const auth = require("../middlewares/auth");
const {
  uploadSingle,
  uploadToCloudinary,
} = require("../middlewares/upload.Cloudinary");

const router = express.Router();

router.get("/", gameController.getAllGames);
router.get("/best-sellers", gameController.getBestSellers);
router.get("/offers", gameController.getOffers);
router.get("/featured", gameController.getFeaturedGames);

// router.use(auth.protect, auth.restrictTo("admin"));

router.get("/admin", auth.protect, auth.restrictTo("admin"), gameController.getAllGames);
router.get("/id/:id", gameController.getGameById);

router.post(
  "/",
  auth.protect, auth.restrictTo("admin"),
  uploadSingle("photo"),
  uploadToCloudinary,
  gameController.createGame
);

router.patch("/:id", auth.protect, auth.restrictTo("admin"), gameController.updateGame);
router.patch("/:id/feature", auth.protect, auth.restrictTo("admin"), gameController.toggleFeaturedGame);
router.patch("/:id/toggle-active", auth.protect, auth.restrictTo("admin"), gameController.toggleActiveGame);
router.delete("/:id", auth.protect, auth.restrictTo("admin"), gameController.deleteGame);

router.get("/:slug", gameController.getGameBySlug);

module.exports = router;
