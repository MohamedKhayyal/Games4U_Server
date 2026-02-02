const Device = require("../models/devices.model");
const APIFeatures = require("../utilts/api.features");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

exports.createDevice = catchAsync(async (req, res) => {
  const device = await Device.create({
    ...req.body,
    photo: req.body.photo,
  });

  logger.info(`Device created: ${device.name}`);

  res.status(201).json({
    status: "success",
    data: { device },
  });
});

exports.getActiveDevices = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Device.find({ isActive: true }),
    req.query,
    ["price", "sold", "createdAt"]
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const devices = await features.query;

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getAllDevicesAdmin = catchAsync(async (req, res) => {
  const devices = await Device.find().sort("-createdAt");

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
    return next(new AppError("Device not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { device },
  });
});

exports.getDeviceById = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  if (!device) return next(new AppError("Device not found", 404));

  res.status(200).json({
    status: "success",
    data: { device },
  });
});

exports.updateDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  if (!device) return next(new AppError("Device not found", 404));

  ["sold", "finalPrice"].forEach((f) => delete req.body[f]);

  Object.assign(device, req.body);

  await device.save();

  logger.info(`Device updated: ${device.name}`);

  res.status(200).json({
    status: "success",
    data: { device },
  });
});

exports.deleteDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  if (!device) return next(new AppError("Device not found", 404));

  device.isActive = false;
  await device.save();

  logger.warn(`Device deactivated: ${device.name}`);

  res.status(200).json({
    status: "success",
    message: "Device deactivated",
  });
});

exports.toggleActiveDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  if (!device) return next(new AppError("Device not found", 404));

  device.isActive = !device.isActive;
  await device.save();

  res.status(200).json({
    status: "success",
    data: {
      id: device._id,
      isActive: device.isActive,
    },
  });
});

exports.toggleFeaturedDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  if (!device) return next(new AppError("Device not found", 404));

  device.isFeatured = !device.isFeatured;
  await device.save();

  res.status(200).json({
    status: "success",
    data: {
      id: device._id,
      isFeatured: device.isFeatured,
    },
  });
});

exports.getFeaturedDevices = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const devices = await Device.find({
    isFeatured: true,
    isActive: true,
  })
    .sort("-createdAt")
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getBestSellers = catchAsync(async (req, res) => {
  req.query.sort ||= "-sold";
  req.query.limit ||= "10";

  const features = new APIFeatures(
    Device.find({ isActive: true, sold: { $gt: 0 } }),
    req.query,
    ["finalPrice", "sold", "createdAt"]
  )
    .filter()
    .sort()
    .paginate();

  const devices = await features.query;

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});

exports.getDeviceOffers = catchAsync(async (req, res) => {
  const now = new Date();

  const devices = await Device.find({
    isActive: true,
    discount: { $gt: 0 },
    $or: [
      { offerStart: { $lte: now }, offerEnd: { $gte: now } },
      { offerStart: null, offerEnd: null },
    ],
  });

  res.status(200).json({
    status: "success",
    results: devices.length,
    data: { devices },
  });
});
