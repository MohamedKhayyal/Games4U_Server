const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utilts/logger");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

/* =======================
   Token helpers
======================= */
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // 15m
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // 30d
  });

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge,
});

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000)); // 15 min
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(30 * 24 * 60 * 60 * 1000) // 30 days
  );
};

/* =======================
   Signup
======================= */
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Name, email and password are required", 400));
  }

  if (!EMAIL_REGEX.test(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: req.body.photo,
    role: "customer",
  });

  const accessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id,
  });

  sendAuthCookies(res, accessToken, refreshToken);

  logger.info(`User signed up: ${email}`);

  res.status(201).json({
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
    },
  });
});

/* =======================
   Login
======================= */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const accessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id,
  });

  sendAuthCookies(res, accessToken, refreshToken);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
    },
  });
});

/* =======================
   Refresh Token
======================= */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("No refresh token provided", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  const newAccessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  res.cookie("accessToken", newAccessToken, cookieOptions(15 * 60 * 1000));

  res.status(200).json({ status: "success" });
});

/* =======================
   Logout
======================= */
exports.logout = (req, res) => {
  res.cookie("accessToken", "", { expires: new Date(0) });
  res.cookie("refreshToken", "", { expires: new Date(0) });

  logger.info("User logged out");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
