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
  // 🔐 تأكيد إن Admin بس
  if (req.user.role !== "admin") {
    return next(new AppError("You are not allowed to access this resource", 403));
  }

  /* =========================
     Filters
  ========================= */
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status; // pending | confirmed | cancelled
  }

  /* =========================
     Pagination
  ========================= */
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  /* =========================
     Query
  ========================= */
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(filter);

  logger.info(
    `Admin fetched orders | count=${orders.length} | page=${page}`
  );

  /* =========================
     Response
  ========================= */
  res.status(200).json({
    status: "success",
    results: orders.length,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
    data: {
      orders,
    },
  });
});


exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  logger.warn("Order has been updated")

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "items.item",
    "name photo"
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You are not allowed to view this order", 403));
  }

  res.status(200).json({
    status: "success",
    data: { order },
  });
});


