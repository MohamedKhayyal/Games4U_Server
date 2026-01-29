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
router.get("/:slug", gameController.getGameBySlug);

router.post(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  uploadSingle("photo"),
  uploadToCloudinary,
  gameController.createGame
);

router.patch(
  "/offers/bulk",
  auth.protect,
  auth.restrictTo("admin"),
  gameController.bulkUpdateOffers
);

router.patch(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  gameController.updateGame
);

router.delete(
  "/:id",
  auth.protect,
  auth.restrictTo("admin"),
  gameController.deleteGame
);

router.get("/id/:id", auth.protect, auth.restrictTo("admin"), gameController.getGameById);

module.exports = router;
