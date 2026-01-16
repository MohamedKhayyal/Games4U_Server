const mongoose = require("mongoose");
const logger = require("../utilts/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    logger.info(`MongoDB Connected To Atlas`);
  } catch (error) {
    logger.error("MongoDB connection failed");
    logger.error(error.message);
    throw error;
  }
};

module.exports = connectDB;
