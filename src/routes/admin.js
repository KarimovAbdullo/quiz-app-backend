const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const adminMiddleware = require("../middleware/adminMiddleware");
const Category = require("../models/Category");
const Question = require("../models/Question");
const { translateQuestion } = require("../utils/translate");
const router = express.Router();

// Configure multer for image uploads
// Store images in 'uploads/questions' directory
const uploadDir = path.join(__dirname, "../../uploads/questions");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `question-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * GET /admin/categories
 * Get all categories (for admin to select when adding questions)
 * Protected route (Admin only)
 */
router.get("/categories", adminMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      categories: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        order: cat.order,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

/**
 * POST /admin/questions
 * Add a new question (Admin only)
 * Body: { categoryId, question (Uzbek), options: [{text: string, isCorrect: boolean}] }
 * Optional: image file (multipart/form-data)
 * 
 * Admin writes question and options ONLY in Uzbek (uz)
 * Backend automatically translates to Russian (ru) and English (en)
 * Translations are saved in database and NOT translated on every request
 */
router.post(
  "/questions",
  adminMiddleware,
  upload.single("image"), // Handle single image file
  async (req, res) => {
    try {
      const { categoryId, question, options } = req.body;

      // Validate input
      if (!categoryId || !question || !options) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Please provide categoryId, question (in Uzbek), and options (in Uzbek)",
        });
      }

      // Parse options if it's a string (JSON)
      let optionsArray;
      try {
        optionsArray = typeof options === "string" ? JSON.parse(options) : options;
      } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Invalid options format. Must be a valid JSON array",
        });
      }

      // Validate options
      if (!Array.isArray(optionsArray) || optionsArray.length !== 4) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Question must have exactly 4 options",
        });
      }

      // Validate that exactly one option is correct
      const correctCount = optionsArray.filter((opt) => opt.isCorrect === true).length;
      if (correctCount !== 1) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Exactly one option must be marked as correct",
        });
      }

      // Check if category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Translate question and options from Uzbek to Russian and English
      // Uzbek (uz) is the base language
      console.log("🔄 Translating question and options from Uzbek to Russian and English...");
      const translated = await translateQuestion(question, optionsArray);

      // Get image URL if file was uploaded
      let imageUrl = null;
      if (req.file) {
        // For Railway/deployment, you might want to use a cloud storage service
        // For now, we'll use a relative path or full URL
        // In production, consider using AWS S3, Cloudinary, or similar
        imageUrl = `/uploads/questions/${req.file.filename}`;
        // If you have a base URL, use it:
        // imageUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/questions/${req.file.filename}`;
      }

      // Create question
      const newQuestion = new Question({
        categoryId,
        question: translated.question,
        options: translated.options,
        image: imageUrl,
      });

      await newQuestion.save();

      console.log("✅ Question created successfully with translations");

      res.status(201).json({
        success: true,
        message: "Question added successfully. Translations saved to database.",
        question: {
          id: newQuestion._id,
          categoryId: newQuestion.categoryId,
          question: {
            uz: newQuestion.question.uz, // Original Uzbek
            ru: newQuestion.question.ru, // Translated to Russian
            en: newQuestion.question.en, // Translated to English
          },
          options: newQuestion.options.map((opt) => ({
            text: {
              uz: opt.text.uz, // Original Uzbek
              ru: opt.text.ru, // Translated to Russian
              en: opt.text.en, // Translated to English
            },
            isCorrect: opt.isCorrect,
          })),
          image: newQuestion.image,
          createdAt: newQuestion.createdAt,
        },
      });
    } catch (error) {
      // Delete uploaded file if error occurs
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Error adding question",
        error: error.message,
      });
    }
  }
);

/**
 * GET /admin/questions
 * Get all questions (Admin only, for management)
 */
router.get("/questions", adminMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.query;

    const query = categoryId ? { categoryId } : {};

    const questions = await Question.find(query)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions: questions.map((q) => ({
        id: q._id,
        category: {
          id: q.categoryId._id,
          name: q.categoryId.name,
        },
        question: q.question,
        options: q.options,
        image: q.image,
        createdAt: q.createdAt,
      })),
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
