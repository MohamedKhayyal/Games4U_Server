const mongoose = require("mongoose");
const slugify = require("slugify");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Device description is required"],
      trim: true,
      maxlength: 3000,
    },

    condition: {
      type: String,
      enum: ["new", "used"],
      required: [true, "Device condition is required"],
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Device price is required"],
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

    photo: {
      type: String,
      required: [true, "Device image is required"],
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
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

deviceSchema.pre("save", function (next) {
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

deviceSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
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

deviceSchema.virtual("isOnOffer").get(function () {
  if (!this.discount || this.discount === 0) return false;

  const now = new Date();

  if (this.offerStart && this.offerEnd) {
    return now >= this.offerStart && now <= this.offerEnd;
  }

  return true;
});

deviceSchema.index({ sold: -1 });
deviceSchema.index({ price: 1 });
deviceSchema.index({ createdAt: -1 });

const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;
