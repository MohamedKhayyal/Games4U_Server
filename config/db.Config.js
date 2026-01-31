const mongoose = require("mongoose");
const logger = require("../utilts/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    logger.info("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("MongoDB Connected To Atlas");
  } catch (error) {
    logger.error("MongoDB connection failed");
    logger.error(error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
