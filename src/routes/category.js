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
      uzb: "uz",
      rus: "ru",
      eng: "en",
      uz: "uz",
      ru: "ru",
      en: "en",
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
        let categoryName = "Unknown";
        let originName = "Unknown";

        // Debug: Log category structure (only in development)
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Category Debug:", {
            id: category._id.toString().substring(0, 8),
            name: category.name,
            nameType: typeof category.name,
            selectedLanguage,
          });
        }

        // Check if category.name exists
        if (category.name) {
          // Check if category.name is an object (new multi-language format)
          if (
            typeof category.name === "object" &&
            category.name !== null &&
            !Array.isArray(category.name) &&
            category.name.uz !== undefined
          ) {
            // Multi-language format: { uz: "...", ru: "...", en: "..." }
            categoryName =
              category.name[selectedLanguage] ||
              category.name.uz ||
              category.name.ru ||
              category.name.en ||
              "Unknown";

            // origin_name always English
            originName = category.name.en || "Unknown";
          } else if (typeof category.name === "string") {
            // Old format (string) - fallback with translations
            const categoryTranslations = {
              Movies: { uz: "Kinolar", ru: "Фильмы", en: "Movies" },
              Science: { uz: "Fan", ru: "Наука", en: "Science" },
              Game: { uz: "O'yinlar", ru: "Игры", en: "Games" },
              Games: { uz: "O'yinlar", ru: "Игры", en: "Games" }, // Also handle "Games"
              Football: { uz: "Futbol", ru: "Футбол", en: "Football" },
              MMA: { uz: "MMA", ru: "ММА", en: "MMA" },
              Music: { uz: "Musiqa", ru: "Музыка", en: "Music" },
            };

            const translations = categoryTranslations[category.name];
            if (translations) {
              categoryName =
                translations[selectedLanguage] ||
                translations.uz ||
                translations.en ||
                category.name;
              originName = translations.en || category.name;
            } else {
              // No translation found, use original name
              categoryName = category.name;
              originName = category.name;
            }
          }
        }

        // Final fallback - if still Unknown, log error
        if (categoryName === "Unknown" || originName === "Unknown") {
          console.error("⚠️ Category name issue:", {
            categoryId: category._id,
            name: category.name,
            nameType: typeof category.name,
            categoryName,
            originName,
          });
        }

        return {
          id: category._id,
          name: categoryName,
          origin_name: originName,
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
