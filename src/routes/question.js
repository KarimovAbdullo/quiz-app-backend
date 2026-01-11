const express = require("express");
const Question = require("../models/Question");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * POST /questions/answer
 * Mark a question as solved for the current user
 * Protected route (JWT required)
 * Body: { questionId, isCorrect }
 *
 * isCorrect: true - to'g'ri javob, false - noto'g'ri javob
 *
 * NOTE: This route must be defined BEFORE /:categoryId to avoid route conflicts
 */
router.post("/answer", authMiddleware, async (req, res) => {
  try {
    const { questionId, isCorrect } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide questionId",
      });
    }

    // isCorrect is optional, default to false if not provided
    const answerIsCorrect = isCorrect === true;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Get user
    const user = await User.findById(userId);

    // Check if question is already solved
    if (user.solvedQuestions.includes(questionId)) {
      return res.status(200).json({
        success: true,
        message: "Question already marked as solved",
        solvedQuestions: user.solvedQuestions,
        correctAnswers: user.correctAnswers,
      });
    }

    // Add questionId to solvedQuestions array (all answered questions)
    user.solvedQuestions.push(questionId);

    // If answer is correct, add to correctlySolvedQuestions and increment correctAnswers
    if (answerIsCorrect) {
      user.correctlySolvedQuestions.push(questionId);
      user.correctAnswers = (user.correctAnswers || 0) + 1;

      // Update status based on correctAnswers count
      if (user.correctAnswers >= 51) {
        user.status = "super daxo";
      } else if (user.correctAnswers >= 11) {
        user.status = "super";
      } else {
        user.status = "boshlang'ich";
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Question marked as solved",
      solvedQuestions: user.solvedQuestions,
      correctAnswers: user.correctAnswers,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving answer",
      error: error.message,
    });
  }
});

/**
 * GET /questions/:categoryId
 * Get all unsolved questions for a specific category
 * Protected route (JWT required)
 * 
 * Returns questions in user's preferred language
 * Language can be specified in query param (?language=uzb) or taken from user profile
 */
router.get("/:categoryId", authMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { language } = req.query; // Optional language override from query param
    const userId = req.user._id;

    // Get user's solved questions and language preference
    const user = await User.findById(userId);
    const solvedQuestionIds = user.solvedQuestions || [];
    
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
    let userLanguage = language || user.language || "uz";
    
    // Normalize language code
    userLanguage = languageMap[userLanguage] || userLanguage;
    
    // Validate language
    if (!["uz", "ru", "en"].includes(userLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Must be: uz, ru, or en (or uzb, rus, eng)",
      });
    }

    // Find questions in this category that user hasn't solved
    const questions = await Question.find({
      categoryId: categoryId,
      _id: { $nin: solvedQuestionIds },
    });

    // Format questions for user's language (from database, NO translation here)
    // Translations are already saved in database when question was created
    const formattedQuestions = questions.map((question) => {
      return {
        id: question._id,
        categoryId: question.categoryId,
        question: question.question[userLanguage] || question.question.uz, // Fallback to Uzbek
        options: question.options.map((option) => ({
          id: option._id,
          text: option.text[userLanguage] || option.text.uz, // Fallback to Uzbek
          // Don't include isCorrect in response (security)
        })),
        image: question.image || null,
        createdAt: question.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedQuestions.length,
      language: userLanguage,
      questions: formattedQuestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error: error.message,
    });
  }
});

module.exports = router;
