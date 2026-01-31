const express = require("express");
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const connectDB = require("./config/db.Config");
const corsHandler = require("./middlewares/cors.Handler");
const logger = require("./utilts/logger");
const AppError = require("./utilts/app.Error");
const errorHandler = require("./middlewares/error.Handler");

const {
  apiLimiter,
  authLimiter,
  adminLimiter,
} = require("./middlewares/rate.Limiters");

// Routes
const authRoute = require("./routes/auth.Route");
const userRoute = require("./routes/user.Route");
const gameRoute = require("./routes/game.Route");
const deviceRoute = require("./routes/device.Route");
const bannerRoute = require("./routes/banner.Route");
const cartRoute = require("./routes/cart.Route");
const orderRoute = require("./routes/order.Route");
const adminRoute = require("./routes/admin.Route");
const logsRoutes = require("./routes/logs.Route");

const app = express();

app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Games4U API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(corsHandler);
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/admin", adminLimiter, adminRoute);

app.use("/api/users", userRoute);
app.use("/api/games", gameRoute);
app.use("/api/devices", deviceRoute);
app.use("/api/banners", bannerRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/logs", logsRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

const startServer = async () => {
  logger.info("Starting server...");

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${PORT}`);

    connectDB()
      .then(() => logger.info("DB connection attempt finished"))
      .catch(() => { });
  });
};

startServer();

