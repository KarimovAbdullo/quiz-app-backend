const mongoose = require("mongoose");

// Option Schema (embedded in Question) - Multi-language support
// Uzbek (uz) is the base language, automatically translated to Russian (ru) and English (en)
const optionSchema = new mongoose.Schema(
  {
    text: {
      uz: { type: String, required: true }, // Uzbek (base language)
      ru: { type: String, required: true }, // Russian (translated)
      en: { type: String, required: true }, // English (translated)
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

// Question Schema - Multi-language support
// Uzbek (uz) is the base language, automatically translated to Russian (ru) and English (en)
const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    question: {
      uz: { type: String, required: true, trim: true }, // Uzbek (base language)
      ru: { type: String, required: true, trim: true }, // Russian (translated)
      en: { type: String, required: true, trim: true }, // English (translated)
    },
    image: {
      type: String, // URL to image (optional)
      default: null,
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
