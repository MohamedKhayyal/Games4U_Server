const User = require("../models/user.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");

exports.updateMyPhoto = catchAsync(async (req, res, next) => {
  if (!req.body.photo) {
    return next(new AppError("Please upload an image", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      photo: req.body.photo,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("name email photo role");

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
