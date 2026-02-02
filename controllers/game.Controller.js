const Game = require("../models/games.model");
const APIFeatures = require("../utilts/api.features");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

const calcFinalPrice = (price, discount = 0) =>
  discount > 0 ? Math.round(price - (price * discount) / 100) : price;

exports.createGame = catchAsync(async (req, res) => {
  const { discount = 0, variants } = req.body;

  ["primary", "secondary"].forEach((type) => {
    const v = variants?.[type];
    if (v?.enabled) {
      v.finalPrice = calcFinalPrice(v.price, discount);
    }
  });

  const game = await Game.create({
    ...req.body,
    photo: req.body.photo,
    variants,
  });

  logger.info(`Game created: ${game.name}`);

  res.status(201).json({
    status: "success",
    data: { game },
  });
});

exports.getAllGames = catchAsync(async (req, res) => {
  const filter = req.user?.role === "admin" ? {} : { isActive: true };

  const features = new APIFeatures(
    Game.find(filter),
    req.query,
    ["platform", "category", "sold", "createdAt"]
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const games = await features.query;

  res.status(200).json({
    status: "success",
    results: games.length,
    data: { games },
  });
});

exports.getGameBySlug = catchAsync(async (req, res, next) => {
  const game = await Game.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!game) return next(new AppError("Game not found", 404));

  res.status(200).json({
    status: "success",
    data: { game },
  });
});

exports.getGameById = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) return next(new AppError("Game not found", 404));

  res.status(200).json({
    status: "success",
    data: { game },
  });
});

exports.updateGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) return next(new AppError("Game not found", 404));

  delete req.body.sold;

  Object.assign(game, req.body);

  const discount = game.discount || 0;

  ["primary", "secondary"].forEach((type) => {
    const v = game.variants?.[type];
    if (v?.enabled && v.price != null) {
      v.finalPrice = calcFinalPrice(v.price, discount);
    }
  });

  await game.save();

  logger.info(`Game updated: ${game.name}`);

  res.status(200).json({
    status: "success",
    data: { game },
  });
});

exports.deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) return next(new AppError("Game not found", 404));

  game.isActive = false;
  await game.save();

  logger.warn(`Game deactivated: ${game.name}`);

  res.status(200).json({
    status: "success",
    message: "Game deactivated",
  });
});

exports.toggleActiveGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) return next(new AppError("Game not found", 404));

  game.isActive = !game.isActive;
  await game.save();

  res.status(200).json({
    status: "success",
    data: {
      id: game._id,
      isActive: game.isActive,
    },
  });
});

exports.toggleFeaturedGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) return next(new AppError("Game not found", 404));

  game.isFeatured = !game.isFeatured;
  await game.save();

  res.status(200).json({
    status: "success",
    data: {
      id: game._id,
      isFeatured: game.isFeatured,
    },
  });
});

exports.getFeaturedGames = catchAsync(async (req, res) => {
  const games = await Game.find({
    isFeatured: true,
    isActive: true,
  }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: games.length,
    data: { games },
  });
});

exports.getBestSellers = catchAsync(async (req, res) => {
  req.query.sort ||= "-sold";
  req.query.limit ||= "10";

  const features = new APIFeatures(
    Game.find({ isActive: true, sold: { $gt: 0 } }),
    req.query,
    ["price", "sold", "createdAt"]
  )
    .filter()
    .sort()
    .paginate();

  const games = await features.query;

  res.status(200).json({
    status: "success",
    results: games.length,
    data: { games },
  });
});

exports.getOffers = catchAsync(async (req, res) => {
  const now = new Date();

  const games = await Game.find({
    isActive: true,
    discount: { $gt: 0 },
    $or: [
      { offerStart: { $lte: now }, offerEnd: { $gte: now } },
      { offerStart: null, offerEnd: null },
    ],
  });

  res.status(200).json({
    status: "success",
    results: games.length,
    data: { games },
  });
});
