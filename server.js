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

//Routes
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
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// GLOBAL MIDDLEWARES
app.use(corsHandler);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// RATE LIMITERS

// Global API
app.use("/api", apiLimiter);

// Auth
app.use("/api/auth", authLimiter, authRoute);

// Admin (protected & limited)
app.use("/api/admin", adminLimiter, adminRoute);

// public
app.use("/api/users", userRoute);
app.use("/api/games", gameRoute);
app.use("/api/devices", deviceRoute);
app.use("/api/banners", bannerRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/logs", logsRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Games4U API is running",
  });
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

const startServer = async () => {
  try {
    logger.info("Starting server...");
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Server failed to start", err);
    process.exit(1);
  }
};

startServer();