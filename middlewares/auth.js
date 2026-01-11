const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendFail } = require("../utilts/response");
const STATUS_CODES = require("../utilts/response.Codes");
const catchAsync = require("../utilts/catch.Async");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return sendFail(
      res,
      {},
      "You are not logged in. Please log in to access this route.",
      STATUS_CODES.UNAUTHORIZED
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select(
    "_id name email role"
  );

  if (!user) {
    return sendFail(
      res,
      {},
      "User belonging to this token no longer exists.",
      STATUS_CODES.UNAUTHORIZED
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendFail(
        res,
        {},
        "You do not have permission to perform this action.",
        STATUS_CODES.FORBIDDEN
      );
    }
    next();
  };
};
