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
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  }).sort("position");


  res.status(200).json({
    status: "success",
    results: banners.length,
    data: { banners },
  });
});

exports.getAllBanners = catchAsync(async (req, res) => {
  const banners = await Banner.find().sort("position");

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: { banners },
  });
});

exports.getBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }

  res.status(200).json({
    status: "success",
    data: {
      banner,
    },
  });
};

exports.updateBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError("Banner not found", 404));

  banner.title = req.body.title ?? banner.title;
  banner.description = req.body.description ?? banner.description;
  banner.discountText = req.body.discountText ?? banner.discountText;
  banner.startDate = req.body.startDate ?? banner.startDate;
  banner.endDate = req.body.endDate ?? banner.endDate;
  banner.position = req.body.position ?? banner.position;

  if (req.file?.path) {
    banner.image = req.file.path;
  }

  await banner.save();

  logger.info(`Banner updated: ${banner.title}`);

  res.status(200).json({
    status: "success",
    data: { banner },
  });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  banner.isActive = false;
  await banner.save();

  logger.warn(`Banner soft deleted (disabled): ${banner.title}`);

  res.status(200).json({
    status: "success",
    message: "Banner disabled successfully",
  });
});

exports.toggleBannerActive = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.status(200).json({
    status: "success",
    data: {
      id: banner._id,
      isActive: banner.isActive,
    },
  });
};
