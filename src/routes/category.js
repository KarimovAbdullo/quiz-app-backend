const express = require("express");
const Category = require("../models/Category");
const Question = require("../models/Question");
const router = express.Router();

const languageMap = {
  uzb: "uz",
  rus: "ru",
  eng: "en",
  uz: "uz",
  ru: "ru",
  en: "en",
};

function getCategoryName(category, selectedLanguage) {
  const name = category.name;
  if (!name || typeof name !== "object") return "Unknown";
  return name[selectedLanguage] || name.uz || name.ru || name.en || "Unknown";
}

/**
 * GET /categories
 * Public. Faqat readyToWork === true bo'lgan kategoriyalar.
 * Query: ?language=eng (default en)
 */
router.get("/", async (req, res) => {
  try {
    const { language } = req.query;
    let lang = languageMap[language] || language || "en";
    if (!["uz", "ru", "en"].includes(lang)) lang = "en";

    const categories = await Category.find({ readyToWork: true }).sort({ order: 1 });

    const list = await Promise.all(
      categories.map(async (cat) => {
        const questionsCount = await Question.countDocuments({ categoryId: cat._id });
        return {
          id: cat._id,
          name: getCategoryName(cat, lang),
          order: cat.order,
          questionsCount,
          readyToWork: cat.readyToWork === true,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: list.length,
      language: lang,
      categories: list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

module.exports = router;
