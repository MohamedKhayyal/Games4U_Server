const express = require("express");
const gameController = require("../controllers/game.Controller");
const auth = require("../middlewares/auth");
const { uploadSingle, resize } = require("../middlewares/upload");

const router = express.Router();

router.get("/", gameController.getAllGames);
router.get("/best-sellers", gameController.getBestSellers);
router.get("/offers", gameController.getOffers);
router.get("/featured", gameController.getFeaturedGames);
router.get("/:slug", gameController.getGameBySlug);

// Admin
router.post(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  uploadSingle("photo"),
  resize,
  gameController.createGame
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

module.exports = router;
