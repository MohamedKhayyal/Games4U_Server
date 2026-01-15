const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Game = require("../models/games.model");
const Device = require("../models/devices.model");
const AppError = require("../utilts/app.Error");
const catchAsync = require("../utilts/catch.Async");
const logger = require("../utilts/logger");

exports.createOrder = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.item"
  );

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const cartItem of cart.items) {
    const item = cartItem.item;
    let price = 0;

    if (!item || !item.isActive) {
      return next(new AppError("One of the items is no longer available", 400));
    }

    if (cartItem.itemType === "game") {
      if (!cartItem.variant) {
        return next(new AppError("Game variant is required", 400));
      }

      const variantData = item.variants?.[cartItem.variant];

      if (!variantData || !variantData.enabled) {
        return next(new AppError("Selected variant not available", 400));
      }

      price = variantData.finalPrice;

      item.sold += cartItem.quantity;
      item.stock = Math.max(item.stock - cartItem.quantity, 0);
      await item.save();
    }

    if (cartItem.itemType === "device") {
      price = item.finalPrice || item.price;

      item.sold += cartItem.quantity;
      item.stock = Math.max(item.stock - cartItem.quantity, 0);
      await item.save();
    }

    const subTotal = price * cartItem.quantity;
    totalPrice += subTotal;

    orderItems.push({
      itemType: cartItem.itemType,
      item: item._id,
      itemTypeModel: cartItem.itemType === "game" ? "Game" : "Device",

      // SNAPSHOT
      name: item.name,
      photo: item.photo,

      variant: cartItem.variant,
      price,
      quantity: cartItem.quantity,
      subTotal,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice,
  });

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  logger.info(
    `Order created | User: ${req.user._id} | Order: ${order._id} | Total: ${totalPrice}`
  );

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  logger.info(`Orders fetched for user: ${req.user._id}`);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  logger.info(`Admin fetched all orders | Count: ${orders.length}`);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});
