const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("../config/db.Config");
const AppError = require("../utilts/app.Error");
const errorHandler = require("../middlewares/error.Handler");

const authRoute = require("../routes/auth.Route");
const userRoute = require("../routes/user.Route");
const gameRoute = require("../routes/game.Route");
const deviceRoute = require("../routes/device.Route");
const bannerRoute = require("../routes/banner.Route");
const cartRoute = require("../routes/cart.Route");
const orderRoute = require("../routes/order.Route");

const app = express();

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://games4-u-mu.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Games4U API running on Vercel",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/games", gameRoute);
app.use("/api/devices", deviceRoute);
app.use("/api/banners", bannerRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
