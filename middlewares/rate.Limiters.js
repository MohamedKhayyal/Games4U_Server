const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const logger = require("../utilts/logger");

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Too many requests, please try again later",
    });
  },
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  skip: (req) => req.path === "/health",
  handler: (req, res) => {
    logger.warn(`Auth brute force attempt | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Too many login attempts, try again later",
    });
  },
});

exports.adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    logger.warn(`Admin rate limit exceeded | IP: ${req.ip}`);
    res.status(429).json({
      status: "fail",
      message: "Admin rate limit exceeded",
    });
  },
});
