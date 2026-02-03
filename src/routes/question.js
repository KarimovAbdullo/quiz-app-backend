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
    const { questionId, selectedOptionIndex } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide questionId",
      });
    }

    if (selectedOptionIndex === undefined || selectedOptionIndex === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide selectedOptionIndex",
      });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if selectedOptionIndex is valid
    if (selectedOptionIndex < 0 || selectedOptionIndex >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid selectedOptionIndex",
      });
    }

    // Check if the selected option is correct
    const selectedOption = question.options[selectedOptionIndex];
    const answerIsCorrect = selectedOption.isCorrect === true;

    // Get user
    const user = await User.findById(userId);

    // If question was already correctly solved before, don't update profile again,
    // but still return the current attempt's result (so battle mode gets correct isCorrect)
    const isAlreadyCorrectlySolved = user.correctlySolvedQuestions.includes(questionId);
    if (isAlreadyCorrectlySolved) {
      return res.status(200).json({
        success: true,
        message: "Question already correctly solved",
        isCorrect: answerIsCorrect, // current attempt result (e.g. battle: wrong → false)
        solvedQuestions: user.solvedQuestions,
        correctAnswers: user.correctAnswers,
        level: user.level || "beginner",
      });
    }

    // Check if question was answered incorrectly before
    const wasAnsweredBefore = user.solvedQuestions.includes(questionId);
    const wasIncorrectlyAnswered = wasAnsweredBefore && !isAlreadyCorrectlySolved;

    // Add questionId to solvedQuestions array if not already there (track all answered questions)
    if (!wasAnsweredBefore) {
      user.solvedQuestions.push(questionId);
    }

    // If answer is correct and wasn't correctly solved before, add to correctlySolvedQuestions
    if (answerIsCorrect && !isAlreadyCorrectlySolved) {
      // Only add if not already in the array (prevent duplicates)
      if (!user.correctlySolvedQuestions.includes(questionId)) {
        user.correctlySolvedQuestions.push(questionId);
        user.correctAnswers = (user.correctAnswers || 0) + 1;

        // Update level by correctAnswers: <50 beginner, 50-99 smart, 100-199 very_smart, 200+ genius
        const n = user.correctAnswers;
        if (n >= 200) user.level = "genius";
        else if (n >= 100) user.level = "very_smart";
        else if (n >= 50) user.level = "smart";
        else user.level = "beginner";
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Question marked as solved",
      isCorrect: answerIsCorrect,
      solvedQuestions: user.solvedQuestions,
      correctAnswers: user.correctAnswers,
      level: user.level || "beginner",
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
 * Get questions for a specific category.
 * Protected route (JWT required)
 *
 * - Normal mode (allMode=false, default): only questions user has NOT correctly answered.
 * - Battle mode (allMode=true): ALL questions in the category (including already correctly answered).
 *
 * allMode: query param (?allMode=true) or user profile allMode (e.g. set via PUT /auth/allMode).
 * Language: query param (?language=uzb) or user profile.
 */
router.get("/:categoryId", authMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { language, allMode: allModeQuery } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const correctlySolvedQuestionIds = user.correctlySolvedQuestions || [];

    // Battle mode: true if query allMode=true OR user.allMode is true
    const allMode = allModeQuery === "true" || allModeQuery === true || user.allMode === true;

    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };

    let userLanguage = language || user.language || "uz";
    userLanguage = languageMap[userLanguage] || userLanguage;

    if (!["uz", "ru", "en"].includes(userLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Must be: uz, ru, or en (or uzb, rus, eng)",
      });
    }

    // allMode (battle): return ALL questions; otherwise exclude correctly solved
    const questionFilter = allMode
      ? { categoryId }
      : { categoryId, _id: { $nin: correctlySolvedQuestionIds } };
    const questions = await Question.find(questionFilter);

    // Format questions for user's language (from database, NO translation here)
    // Translations are already saved in database when question was created
    const baseUrl = process.env.BASE_URL ||
      (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
      'https://quiz-app-backend-production-cd1c.up.railway.app';

    const toFullUrl = (url) => {
      if (!url || (url.startsWith('http://') || url.startsWith('https://'))) return url;
      return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    };

    const formattedQuestions = questions.map((question) => {
      // Support single image or multiple images (e.g. 3 actors)
      let imageUrl = null;
      let imagesArr = null;
      if (question.images && question.images.length > 0) {
        imagesArr = question.images.map(toFullUrl);
      } else if (question.image) {
        imageUrl = toFullUrl(question.image);
      }
      return {
        id: question._id,
        categoryId: question.categoryId,
        question: question.question[userLanguage] || question.question.uz,
        options: question.options.map((option) => ({
          id: option._id,
          text: option.text[userLanguage] || option.text.uz,
        })),
        image: imageUrl,
        images: imagesArr,
        createdAt: question.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedQuestions.length,
      language: userLanguage,
      allMode, // true = battle (all questions), false = only unsolved
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
