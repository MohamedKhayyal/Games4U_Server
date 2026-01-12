const mongoose = require("mongoose");
const slugify = require("slugify");

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Game name is required"],
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Game description is required"],
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, "Game price is required"],
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    offerStart: Date,
    offerEnd: Date,

    finalPrice: {
      type: Number,
      min: 0,
    },

    platform: {
      type: String,
      enum: ["ps5", "ps4", "xbox"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ["action", "sports", "rpg", "adventure", "fps", "platformer"],
      required: true,
      index: true,
    },

    photo: {
      type: String,
      required: [true, "Game image is required"],
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    sold: {
      type: Number,
      default: 0,
      index: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

gameSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }

  if (this.isModified("price") || this.isModified("discount")) {
    this.finalPrice =
      this.discount > 0
        ? Math.round(this.price - (this.price * this.discount) / 100)
        : this.price;
  }

});

// Update middleware for findOneAndUpdate update price and slug if we update them
gameSchema.pre("findOneAndUpdate", async function () {
  let update = this.getUpdate();

  if (!update) return;

  const data = update.$set ? update.$set : update;

  if (data.name) {
    data.slug = slugify(data.name, { lower: true });
  }

  if (data.price !== undefined || data.discount !== undefined) {
    const doc = await this.model.findOne(this.getQuery());

    if (!doc) return;

    const price = data.price !== undefined ? data.price : doc.price;

    const discount = data.discount !== undefined ? data.discount : doc.discount;

    data.finalPrice =
      discount > 0 ? Math.round(price - (price * discount) / 100) : price;
  }

  if (update.$set) {
    update.$set = data;
  } else {
    this.setUpdate(data);
  }
});

gameSchema.virtual("isOnOffer").get(function () {
  if (!this.discount || this.discount === 0) return false;

  const now = new Date();

  if (this.offerStart && this.offerEnd) {
    return now >= this.offerStart && now <= this.offerEnd;
  }

  return true;
});

gameSchema.index({ sold: -1 });
gameSchema.index({ price: 1 });
gameSchema.index({ createdAt: -1 });

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
