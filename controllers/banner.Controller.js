const Banner = require("../models/banner.model");
const catchAsync = require("../utilts/catch.Async");
const AppError = require("../utilts/app.Error");
const logger = require("../utilts/logger");

exports.createBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.create({
    ...req.body,
    image: req.body.image,
  });

  logger.info(`Banner created: ${banner.title}`);

  res.status(201).json({
    status: "success",
    data: { banner },
  });
});

exports.getActiveBanners = catchAsync(async (req, res, next) => {
  const now = new Date();

  const banners = await Banner.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ position: 1 })
    .limit(10);

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: { banners },
  });
});

exports.updateBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  logger.info(`Banner updated: ${banner.title}`);

  res.status(200).json({
    status: "success",
    data: { banner },
  });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  logger.warn(`Banner deleted: ${banner.title}`);

  res.status(204).json({ status: "success" });
});
