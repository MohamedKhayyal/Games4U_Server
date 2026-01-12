const Game = require("../models/games.model");
const APIFeatures = require("../utilts/api.features");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

exports.createGame = catchAsync(async (req, res, next) => {
  const game = await Game.create({
    ...req.body,
    photo: req.body.photo,
  });

  logger.info(`Game created: ${game.name} (${game._id})`);

  res.status(201).json({
    status: "success",
    data: {
      game,
    },
  });
});

exports.getAllGames = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Game.find({ isActive: true }), req.query, [
    "price",
    "discount",
    "platform",
    "category",
    "isFeatured",
    "sold",
    "createdAt",
  ])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const games = await features.query;
  if (!games) {
    logger.warn("No games found");
    return next(new AppError("No games found", 404));
  }
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

  if (!game) {
    logger.warn(`Game not found with slug: ${req.params.slug}`);
    return next(new AppError("Game not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      game,
    },
  });
});

exports.updateGame = catchAsync(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError("No data provided for update", 400));
  }

  const game = await Game.findById(req.params.id);

  if (!game) {
    logger.warn(`Update failed, game not found: ${req.params.id}`);
    return next(new AppError("Game not found", 404));
  }

  const forbiddenFields = ["sold", "rating", "finalPrice"];
  forbiddenFields.forEach((field) => delete req.body[field]);

  Object.entries(req.body).forEach(([key, value]) => {
    game[key] = value;
  });

  await game.save();

  logger.info(`Game updated: ${game.name} (${game._id})`);

  res.status(200).json({
    status: "success",
    data: {
      game,
    },
  });
});

exports.deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!game) {
    logger.warn(`Delete failed, game not found: ${req.params.id}`);
    return next(new AppError("Game not found", 404));
  }

  logger.warn(`Game soft deleted: ${game.name} (${game._id})`);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getBestSellers = catchAsync(async (req, res, next) => {
  const games = await Game.find({
    isActive: true,
    sold: { $gt: 0 },
  })
    .sort({ sold: -1 })
    .limit(10);

  res.status(200).json({
    status: "success",
    results: games.length,
    data: { games },
  });
});

exports.getOffers = catchAsync(async (req, res, next) => {
  const now = new Date();

  const games = await Game.find({
    isActive: true,
    discount: { $gt: 0 },
    $or: [
      {
        offerStart: { $lte: now },
        offerEnd: { $gte: now },
      },
      {
        offerStart: { $exists: false },
        offerEnd: { $exists: false },
      },
    ],
  });

  res.status(200).json({
    status: "success",
    results: games.length,
    data: {
      games,
    },
  });
});

exports.getFeaturedGames = catchAsync(async (req, res, next) => {
  const limit = Number(req.query.limit) || 6;

  const games = await Game.find({
    isActive: true,
    isFeatured: true,
  }).limit(limit);

  res.status(200).json({
    status: "success",
    results: games.length,
    data: {
      games,
    },
  });
});

// Bulk update offers for multiple games
exports.bulkUpdateOffers = catchAsync(async (req, res, next) => {
  const { filter = {}, discount, offerStart, offerEnd } = req.body;

  if (discount === undefined) {
    return next(new AppError("Discount is required", 400));
  }

  const games = await Game.find(filter);

  if (!games.length) {
    logger.warn("Bulk offers: no games matched filter");
    return res.status(200).json({
      status: "success",
      matched: 0,
      modified: 0,
    });
  }

  let modified = 0;

  for (const game of games) {
    game.discount = discount;
    game.offerStart = offerStart || null;
    game.offerEnd = offerEnd || null;

    game.finalPrice =
      discount > 0
        ? Math.round(game.price - (game.price * discount) / 100)
        : game.price;

    await game.save();
    modified++;
  }

  logger.info(
    `Bulk offers applied | Discount: ${discount}% | Games updated: ${modified}`
  );

  res.status(200).json({
    status: "success",
    matched: games.length,
    modified,
  });
});


