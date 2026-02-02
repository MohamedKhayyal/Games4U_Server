const rateLimit = require("express-rate-limit");
const logger = require("../utilts/logger");

// global limit
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Too many requests, please try again later",
    });
  },
});

// AUTH LIMIT (LOGIN / SIGNUP)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth brute force attempt | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Too many login attempts, try again later",
    });
  },
});

// ADMIN LIMIT
exports.adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Admin rate limit exceeded | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Admin rate limit exceeded",
    });
  },
});