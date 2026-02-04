const mongoose = require("mongoose");

const appConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppConfig", appConfigSchema);
