const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["game", "device"],
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "items.itemTypeModel",
    },

    itemTypeModel: {
      type: String,
      required: true,
      enum: ["Game", "Device"],
    },

    variant: {
      type: String,
      enum: ["primary", "secondary"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
