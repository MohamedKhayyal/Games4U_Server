const express = require("express");
const authController = require("../controllers/auth.Controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/signup",  authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);


module.exports = router;
