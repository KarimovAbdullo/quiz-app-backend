const mongoose = require("mongoose");

// Category Schema - Multi-language support
const categorySchema = new mongoose.Schema(
  {
    name: {
      uz: { type: String, required: true, trim: true }, // Uzbek
      ru: { type: String, required: true, trim: true }, // Russian
      en: { type: String, required: true, trim: true }, // English
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
