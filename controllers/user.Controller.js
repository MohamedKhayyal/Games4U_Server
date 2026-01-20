const User = require("../models/user.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");

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
