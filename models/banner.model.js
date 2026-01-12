const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      required: [true, "Banner image is required"],
    },

    discountText: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    position: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: [true, "Banner start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "Banner end date is required"],
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

bannerSchema.pre("save", function () {
  if (this.startDate >= this.endDate) {
    throw new Error("Banner endDate must be after startDate");
  }
});

bannerSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (!update) return;

  const data = update.$set || update;

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error("Banner endDate must be after startDate");
    }
  }
});

bannerSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
