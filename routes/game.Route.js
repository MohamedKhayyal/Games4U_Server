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

router.use(auth.protect, auth.restrictTo("admin"));

router.get("/id/:id", gameController.getGameById);

router.post(
  "/",
  uploadSingle("photo"),
  uploadToCloudinary,
  gameController.createGame
);

router.patch("/offers/bulk", gameController.bulkUpdateOffers);

router.patch("/:id", gameController.updateGame);

router.patch("/:id/feature", gameController.toggleFeaturedGame);

router.delete("/:id", gameController.deleteGame);

module.exports = router;
