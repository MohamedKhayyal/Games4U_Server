const User = require("../models/user.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger")

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Use /update-password",
        400,
      ),
    );
  }

  const allowedFields = ["name", "photo"];
  const filteredBody = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  }).select("name email photo role");

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.status(200).json({
      status: "success",
      data: { user: null },
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
        role: req.user.role,
      },
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.toggleAdminRole = catchAsync(async (req, res, next) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    logger.warn(
      `Toggle admin role failed | User not found | Target ID: ${req.params.id}`
    );
    return next(new AppError("User not found", 404));
  }

  if (targetUser._id.toString() === req.user._id.toString()) {
    logger.warn(
      `Admin tried to change own role | Admin ID: ${req.user._id}`
    );
    return next(new AppError("You cannot change your own role", 400));
  }

  const oldRole = targetUser.role;
  targetUser.role = oldRole === "admin" ? "customer" : "admin";
  await targetUser.save();

  logger.info(
    `User role updated | Admin: ${req.user.name}, ${req.user._id}| Target: ${targetUser.name}, ${targetUser._id}  | ${oldRole} → ${targetUser.role}`
  );

  res.status(200).json({
    status: "success",
    data: {
      id: targetUser._id,
      role: targetUser.role,
    },
  });
});
