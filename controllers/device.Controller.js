const Device = require("../models/devices.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

exports.createDevice = catchAsync(async (req, res, next) => {
  const device = await Device.create({
    ...req.body,
    photo: req.body.photo,
  });

  logger.info(`Device created: ${device.name} (${device._id})`);

  res.status(201).json({
    status: "success",
    data: { device },
  });
});

exports.getAllDevices = catchAsync(async (req, res, next) => {
  const devices = await Device.find({ isActive: true });

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getDeviceBySlug = catchAsync(async (req, res, next) => {
  const device = await Device.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!device) {
    logger.warn(`Device not found with slug: ${req.params.slug}`);
    return next(new AppError("Device not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { device },
  });
});

exports.updateDevice = catchAsync(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError("No data provided for update", 400));
  }

  const device = await Device.findById(req.params.id);

  if (!device) {
    logger.warn(`Update failed, device not found: ${req.params.id}`);
    return next(new AppError("Device not found", 404));
  }

  const forbiddenFields = ["sold", "finalPrice"];
  forbiddenFields.forEach((field) => delete req.body[field]);

  Object.entries(req.body).forEach(([key, value]) => {
    device[key] = value;
  });

  await device.save();

  logger.info(`Device updated: ${device.name} (${device._id})`);

  res.status(200).json({
    status: "success",
    data: { device },
  });
});

exports.deleteDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!device) {
    logger.warn(`Delete failed, device not found: ${req.params.id}`);
    return next(new AppError("Device not found", 404));
  }

  logger.warn(`Device soft deleted: ${device.name} (${device._id})`);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getBestSellerDevices = catchAsync(async (req, res, next) => {
  const devices = await Device.find({
    isActive: true,
    sold: { $gt: 0 },
  })
    .sort({ sold: -1 })
    .limit(10);

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getDeviceOffers = catchAsync(async (req, res, next) => {
  const now = new Date();

  const devices = await Device.find({
    isActive: true,
    discount: { $gt: 0 },
    $or: [
      { offerStart: { $lte: now }, offerEnd: { $gte: now } },
      { offerStart: { $exists: false }, offerEnd: { $exists: false } },
    ],
  });

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getFeaturedDevices = catchAsync(async (req, res, next) => {
  const limit = Number(req.query.limit) || 6;

  const devices = await Device.find({
    isActive: true,
    isFeatured: true,
  }).limit(limit);

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});
