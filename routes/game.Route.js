const express = require("express");
const gameController = require("../controllers/game.Controller");
const auth = require("../middlewares/auth");
const { uploadSingle, resize } = require("../middlewares/upload");

const router = express.Router();

router.get("/", gameController.getAllGames);
router.get("/best-sellers", gameController.getBestSellers);
router.get("/offers", gameController.getOffers);

router.patch(
  "/offers/bulk",
  auth.protect,
  auth.restrictTo("admin"),
  gameController.bulkUpdateOffers
);

router.get("/:slug", gameController.getGameBySlug);

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
  uploadSingle("photo"),
  resize,
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
