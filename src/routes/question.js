const express = require("express");
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

function getBaseUrl() {
  return (
    process.env.BASE_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : null) ||
    "https://quiz-app-backend-production-cd1c.up.railway.app"
  );
}

function toFullUrl(url) {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = getBaseUrl();
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/**
 * GET /questions/:categoryId
 * Public. Kategoriyadagi barcha savollar (options da isCorrect bor).
 * Query: ?language=eng (default en)
 */
router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { language } = req.query;

    let userLanguage = languageMap[language] || language || "en";
    if (!["uz", "ru", "en"].includes(userLanguage)) userLanguage = "en";

    const questions = await Question.find({ categoryId });

    const formattedQuestions = questions.map((q) => {
      let imageUrl = null;
      let imagesArr = null;
      if (q.images && q.images.length > 0) {
        imagesArr = q.images.map(toFullUrl);
      } else if (q.image) {
        imageUrl = toFullUrl(q.image);
      }
      return {
        id: q._id,
        categoryId: q.categoryId,
        question: q.question[userLanguage] || q.question.uz,
        options: q.options.map((opt) => ({
          id: opt._id,
          text: opt.text[userLanguage] || opt.text.uz,
          isCorrect: opt.isCorrect === true,
        })),
        image: imageUrl,
        images: imagesArr,
        createdAt: q.createdAt,
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
