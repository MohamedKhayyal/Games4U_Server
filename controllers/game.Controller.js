const Game = require("../models/games.model");
const APIFeatures = require("../utilts/api.features");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

const calcFinalPrice = (price, discount = 0) =>
  discount > 0 ? Math.round(price - (price * discount) / 100) : price;

exports.createGame = catchAsync(async (req, res, next) => {
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

  logger.info(`Game created: ${game.name} (${game._id})`);

  res.status(201).json({
    status: "success",
    data: { game },
  });
});

exports.getAllGames = catchAsync(async (req, res) => {
  const features = new APIFeatures(Game.find({ isActive: true }), req.query, [
    "platform",
    "category",
    "sold",
    "createdAt",
  ])
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

  if (!game) {
    return next(new AppError("Game not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { game },
  });
});

exports.updateGame = catchAsync(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    logger.warn("Update game failed: empty body");
    return next(new AppError("No data provided for update", 400));
  }

  const game = await Game.findById(req.params.id);
  if (!game) {
    logger.warn(`Update game failed: game not found ${req.params.id}`);
    return next(new AppError("Game not found", 404));
  }

  ["sold", "photo"].forEach((f) => delete req.body[f]);

  Object.assign(game, req.body);

  const discount = game.discount || 0;

  if (game.variants) {
    ["primary", "secondary"].forEach((type) => {
      const variant = game.variants[type];
      if (variant?.enabled && variant.price != null) {
        variant.finalPrice = calcFinalPrice(variant.price, discount);
      }
    });
  }

  await game.save();

  logger.info(
    `Game updated successfully | ID: ${game._id} | Discount: ${discount}%`
  );

  res.status(200).json({
    status: "success",
    data: { game },
  });
});


exports.deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!game) {
    return next(new AppError("Game not found", 404));
  }

  logger.warn(`Game deleted: ${game.name}`);

  res.status(204).json({ status: "success" });
});

exports.getBestSellers = catchAsync(async (req, res) => {
  req.query.sort = req.query.sort || "-sold";
  req.query.limit = req.query.limit || "10";

  const baseQuery = Game.find({
    isActive: true,
    sold: { $gt: 0 },
  });

  const features = new APIFeatures(baseQuery, req.query, [
    "price",
    "sold",
    "createdAt",
    "name",
  ])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const games = await features.query;

  res.status(200).json({
    status: "success",
    results: games.length,
    data: {
      games,
    },
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

exports.bulkUpdateOffers = catchAsync(async (req, res, next) => {
  const { filter = {}, discount, offerStart, offerEnd } = req.body;

  if (discount === undefined) {
    return next(new AppError("Discount is required", 400));
  }

  const games = await Game.find(filter);

  if (!games.length) {
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

    ["primary", "secondary"].forEach((type) => {
      const v = game.variants?.[type];
      if (v?.enabled && v.price != null) {
        v.finalPrice = calcFinalPrice(v.price, discount);
      }
    });

    await game.save();
    modified++;
  }

  logger.info(`Bulk offer applied | discount=${discount}% | games=${modified}`);

  res.status(200).json({
    status: "success",
    matched: games.length,
    modified,
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

exports.toggleFeaturedGame = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    logger.warn(`Toggle featured game failed | Game not found | ID: ${req.params.id}`);
    return next(new AppError("Game not found", 404));
  }

  const oldValue = game.isFeatured;
  game.isFeatured = !game.isFeatured;
  await game.save();

  logger.info(
    `Game featured toggled | Admin: ${req.user._id} | Game: ${game._id} | ${oldValue} → ${game.isFeatured}`
  );

  res.status(200).json({
    status: "success",
    data: {
      id: game._id,
      isFeatured: game.isFeatured,
    },
  });
});

exports.getFeaturedGames = async (req, res) => {
  const games = await Game.find({
    isFeatured: true,
    isActive: true,
  }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: games.length,
    data: {
      games,
    },
  });
};
