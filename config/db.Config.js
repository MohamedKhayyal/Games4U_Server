const mongoose = require("mongoose");
const logger = require("../utilts/logger");

const connectDB = async () => {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB Connected To Atlas");
  } catch (error) {
    logger.error("MongoDB connection failed");
    logger.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
