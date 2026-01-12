const express = require("express");
const Category = require("../models/Category");
const Question = require("../models/Question");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * GET /categories
 * Get all categories with questionsCount and completedCount
 * If token provided, returns user-specific completedCount
 * Public endpoint (token optional)
 * Query param: ?language=uz (optional, default: uz or user's language)
 */
router.get("/", async (req, res) => {
  try {
    // Get language from query param
    const { language } = req.query;

    // Get all categories sorted by order (1, 2, 3, 4, 5, 6)
    const categories = await Category.find().sort({ order: 1 });

    // Get user if token is provided
    let userId = null;
    let userCorrectlySolvedQuestions = [];
    let userLanguage = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        const user = await User.findById(userId);
        if (user) {
          userCorrectlySolvedQuestions = user.correctlySolvedQuestions || [];
          userLanguage = user.language;
        }
      } catch (error) {
        // Token invalid, continue without user data
      }
    }

    // Map language codes: uzb → uz, rus → ru, eng → en
    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };

    // Determine language: query param > user preference > default (uz)
    let selectedLanguage = language || userLanguage || "uz";
    selectedLanguage = languageMap[selectedLanguage] || selectedLanguage;

    // Validate language
    if (!["uz", "ru", "en"].includes(selectedLanguage)) {
      selectedLanguage = "uz"; // Fallback to Uzbek
    }

    // Get questions count and completed count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        // Total questions count in this category
        const questionsCount = await Question.countDocuments({
          categoryId: category._id,
        });

        // User's completed (correctly answered) questions count in this category
        let completedCount = 0;
        if (userId && userCorrectlySolvedQuestions.length > 0) {
          // Count correctly answered questions in this category
          const correctlyAnsweredInCategory = await Question.countDocuments({
            categoryId: category._id,
            _id: { $in: userCorrectlySolvedQuestions },
          });
          completedCount = correctlyAnsweredInCategory;
        }

        // Get category name in selected language
        let categoryName = category.name[selectedLanguage] || category.name.uz;
        
        // Fallback: if category.name is still a string (old format), use it
        if (typeof category.name === "string") {
          categoryName = category.name;
        }

        return {
          id: category._id,
          name: categoryName,
          questionsCount,
          completedCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      language: selectedLanguage,
      categories: categoriesWithCounts,
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
