const mongoose = require("mongoose");
const logger = require("../utilts/logger");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    logger.info("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });

    logger.info("MongoDB Connected To Atlas");
  } catch (error) {
    logger.error("MongoDB connection failed ❌");
    logger.error(error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
