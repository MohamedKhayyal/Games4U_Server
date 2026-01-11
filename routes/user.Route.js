const express = require("express");
const { uploadSingle, resize } = require("../middlewares/upload");
const userController = require("../controllers/user.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.patch(
  "/me/photo",
  auth.protect,
  uploadSingle("photo"),
  resize,
  userController.updateMyPhoto
);

module.exports = router;
