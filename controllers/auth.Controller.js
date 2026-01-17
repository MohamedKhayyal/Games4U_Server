const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utilts/logger");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge:
      Number(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
  });
};

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

  const token = signToken({
    id: user._id,
    role: user.role,
  });

  sendTokenCookie(res, token);

  logger.info(`User signed up: ${email} (${user.role})`);

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

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("Request body is missing", 400));
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isCorrect = await user.correctPassword(password, user.password);
  if (!isCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = signToken({
    id: user._id,
    role: user.role,
  });

  sendTokenCookie(res, token);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      token,
      role: user.role,
    },
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
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

  const admin = await User.create({
    name,
    email,
    password,
    photo: req.body.photo,
    role: "admin",
  });

  const token = signToken({
    id: admin._id,
    role: admin.role,
  });

  sendTokenCookie(res, token);

  logger.warn(`ADMIN CREATED: ${email}`);

  res.status(201).json({
    status: "success",
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      photo: admin.photo,
      role: admin.role,
    },
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });

  logger.info(`User logged out`);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
