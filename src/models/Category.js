const mongoose = require("mongoose");

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Export Category model
module.exports = mongoose.model("Category", categorySchema);
