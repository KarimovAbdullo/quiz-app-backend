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
    avatar: {
      type: String,
      default: null,
    },
    solvedQuestions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Question",
      default: [],
    },
    correctlySolvedQuestions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Question",
      default: [],
    },
    // Level by correct answers: <50 beginner, 50-99 smart, 100-199 very_smart, 200+ genius
    level: {
      type: String,
      enum: ["beginner", "smart", "very_smart", "genius"],
      default: "beginner",
    },
    mode: {
      type: String,
      enum: ["free", "vip", "oddiy", "premium"],
      default: "free",
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ["uz", "ru", "en", "uzb", "rus", "eng"], // Support both formats for backward compatibility
      default: "uz", // Default to "uz" (Uzbek)
    },
    // Battle mode: when true, question list returns ALL questions (including already correctly answered)
    allMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export User model
module.exports = mongoose.model("User", userSchema);
