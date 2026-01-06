const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    solvedQuestions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Question",
      default: [],
    },
    status: {
      type: String,
      enum: ["boshlang'ich", "super", "super daxo"],
      default: "boshlang'ich",
    },
    mode: {
      type: String,
      enum: ["oddiy", "premium"],
      default: "oddiy",
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Export User model
module.exports = mongoose.model("User", userSchema);
