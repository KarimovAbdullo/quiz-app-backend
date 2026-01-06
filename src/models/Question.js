const mongoose = require("mongoose");

// Option Schema (embedded in Question)
const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

// Question Schema
const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: function (options) {
          // Must have exactly 4 options
          if (options.length !== 4) {
            return false;
          }
          // Exactly one option must have isCorrect: true
          const correctCount = options.filter(
            (opt) => opt.isCorrect === true
          ).length;
          return correctCount === 1;
        },
        message:
          "Question must have exactly 4 options, and exactly one must be correct",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Export Question model
module.exports = mongoose.model("Question", questionSchema);
