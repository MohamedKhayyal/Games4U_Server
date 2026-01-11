const User = require("../models/user.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");

exports.updateMyPhoto = catchAsync(async (req, res, next) => {
  if (!req.body.photo) {
    return next(new AppError("Please upload an image", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { photo: req.body.photo },
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
