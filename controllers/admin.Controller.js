const device = require("../models/devices.model");
const game = require("../models/games.model");
const order = require("../models/order.model");
const user = require("../models/user.model");
const APIFeatures = require("../utilts/api.features");
const logger = require("../utilts/logger");

exports.getAdminStats = async (req, res) => {
  try {
    const users = await user.countDocuments();
    const games = await game.countDocuments();
    const devices = await device.countDocuments();
    const orders = await order.countDocuments();

    logger.info(
      `Admin stats fetched | Admin: ${req.user._id} | users=${users}, games=${games}, devices=${devices}, orders=${orders}`
    );

    res.status(200).json({
      status: "success",
      data: { users, games, devices, orders },
    });
  } catch (err) {
    logger.error(`Failed to fetch admin stats | ${err.message}`);
    throw err;
  }
};

exports.getOrdersStats = async (req, res) => {
  try {
    const stats = await order.aggregate([
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    logger.info(
      `Orders stats fetched | Admin: ${req.user._id} | Days=${stats.length}`
    );

    res.status(200).json({
      status: "success",
      data: stats.map((s) => ({
        day: `Day ${s._id}`,
        orders: s.orders,
        revenue: s.revenue,
      })),
    });
  } catch (err) {
    logger.error(`Failed to fetch orders stats | ${err.message}`);
    throw err;
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    req.query.sort = req.query.sort || "-sold";
    req.query.limit = req.query.limit || "10";

    const baseQuery = game.find({
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

    logger.info(
      `Best sellers fetched | Admin: ${req.user._id} | Count=${games.length}`
    );

    res.status(200).json({
      status: "success",
      results: games.length,
      data: { games },
    });
  } catch (err) {
    logger.error(`Failed to fetch best sellers | ${err.message}`);
    throw err;
  }
};
