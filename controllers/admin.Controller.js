const device = require("../models/devices.model");
const game = require("../models/games.model");
const order = require("../models/order.model");
const user = require("../models/user.model");
const APIFeatures = require("../utilts/api.features");


exports.getAdminStats = async (req, res) => {
    const users = await user.countDocuments();
    const games = await game.countDocuments();
    const devices = await device.countDocuments();
    const orders = await order.countDocuments();

    res.status(200).json({
        status: "success",
        data: { users, games, devices, orders },
    });
};

exports.getOrdersStats = async (req, res) => {
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

    res.status(200).json({
        status: "success",
        data: stats.map((s) => ({
            day: `Day ${s._id}`,
            orders: s.orders,
            revenue: s.revenue,
        })),
    });
};

exports.getBestSellers = async (req, res) => {
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
  
    res.status(200).json({
      status: "success",
      results: games.length,
      data: {
        games,
      },
    });
  };
  
