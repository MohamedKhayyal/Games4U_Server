// const mongoose = require("mongoose");
// const logger = require("../utilts/logger");

// const connectDB = async () => {
//   try {
//     if (!process.env.MONGO_URI) {
//       throw new Error("MONGO_URI is not defined in environment variables");
//     }

//     logger.info("Connecting to MongoDB...");

//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000, 
//     });

//     logger.info("MongoDB Connected To Atlas");
//   } catch (error) {
//     logger.error("MongoDB connection failed ❌");
//     logger.error(error.message || error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");
const logger = require("../utilts/logger");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  if (!cached.promise) {
    logger.info("Connecting to MongoDB...");

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongoose) => {
        logger.info("MongoDB Connected To Atlas");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
