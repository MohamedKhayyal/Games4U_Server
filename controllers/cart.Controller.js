const Cart = require("../models/cart.model");
const Game = require("../models/games.model");
const Device = require("../models/devices.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

exports.addToCart = catchAsync(async (req, res, next) => {
  const { itemId, itemType, variant } = req.body;

  if (!itemId || !itemType) {
    return next(new AppError("itemId and itemType are required", 400));
  }

  let item;

  if (itemType === "game") {
    item = await Game.findById(itemId);

    if (!item || !item.isActive) {
      return next(new AppError("Game not available", 404));
    }

    if (variant) {
      const v = item.variants?.[variant];
      if (!v || !v.enabled) {
        return next(new AppError("Variant not available", 400));
      }
    }
  } else if (itemType === "device") {
    item = await Device.findById(itemId);

    if (!item || !item.isActive) {
      return next(new AppError("Device not available", 404));
    }
  } else {
    return next(new AppError("Invalid item type", 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (i) =>
      i.item.toString() === itemId &&
      i.itemType === itemType &&
      i.variant === variant
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      itemType,
      item: item._id,
      itemTypeModel: itemType === "game" ? "Game" : "Device",
      variant,
      quantity: 1,
    });
  }

  await cart.save();

  logger.info(
    `Item added to cart | User: ${req.user._id} | ${itemType} | ItemId: ${itemId}`
  );

  res.status(200).json({
    status: "success",
    data: { cart },
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { itemId, itemType, variant } = req.body;

  if (!itemId || !itemType) {
    return next(new AppError("itemId and itemType are required", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemIndex = cart.items.findIndex(
    (i) =>
      i.item.toString() === itemId &&
      i.itemType === itemType &&
      i.variant === variant
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  const cartItem = cart.items[itemIndex];

  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    cart.items.splice(itemIndex, 1);
  }

  await cart.save();

  logger.info(
    `Cart item updated | User: ${req.user._id} | ${itemType} | ItemId: ${itemId}`
  );

  res.status(200).json({
    status: "success",
    data: { cart },
  });
});

exports.getMyCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.item",
    "name slug photo variants finalPrice price"
  );

  if (!cart) {
    return res.status(200).json({
      status: "success",
      data: { cart: null },
    });
  }

  let totalPrice = 0;

  const items = cart.items.map((i) => {
    let price = 0;

    if (i.itemType === "game") {
      if (i.variant) {
        price = i.item.variants[i.variant].finalPrice;
      }
    } else {
      price = i.item.finalPrice || i.item.price;
    }

    const subTotal = price * i.quantity;
    totalPrice += subTotal;

    return {
      _id: i._id,
      itemType: i.itemType,
      variant: i.variant,
      quantity: i.quantity,
      price,
      subTotal,
      item: i.item,
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      cart: {
        _id: cart._id,
        items,
        totalPrice,
      },
    },
  });
});
