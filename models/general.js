const mongoose = require("mongoose");

function arrayLimit(val) {
  return val.length <= 10;
}

const houseSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    landlordPhone: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{9,15}$/, "Invalid phone number format"],
    },
    uploaderPhone: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{9,15}$/, "Invalid phone number format"],
    },
    photos: {
      type: [String],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
    approval: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for future performance
houseSchema.index({ district: 1, cost: 1 });
houseSchema.index({ approval: 1 });
houseSchema.index({ area: 1 });
houseSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("GeneralHouse", houseSchema);
