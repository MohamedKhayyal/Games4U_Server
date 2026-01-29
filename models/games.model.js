const mongoose = require("mongoose");
const slugify = require("slugify");

const variantSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: 0,
      required: function () {
        return this.enabled;
      },
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      required: true,
      maxlength: 2000,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    offerStart: Date,
    offerEnd: Date,

    variants: {
      primary: variantSchema,
      secondary: variantSchema,
    },

    platform: {
      type: String,
      enum: ["ps5", "ps4", "xbox"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ["action", "sports", "rpg", "adventure", "platformer"],
      required: true,
      index: true,
    },

    photo: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sold: {
      type: Number,
      default: 0,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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

  const hasVariant =
    this.variants?.primary?.enabled || this.variants?.secondary?.enabled;

  if (!hasVariant) {
    throw new Error(
      "At least one variant (primary or secondary) must be enabled"
    );
  }
});

gameSchema.virtual("isOnOffer").get(function () {
  if (!this.discount) return false;

  const now = new Date();
  if (this.offerStart && this.offerEnd) {
    return now >= this.offerStart && now <= this.offerEnd;
  }
  return true;
});

gameSchema.index({ sold: -1 });
gameSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Game", gameSchema);
