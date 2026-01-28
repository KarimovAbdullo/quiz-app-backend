const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const adminMiddleware = require("../middleware/adminMiddleware");
const Category = require("../models/Category");
const Question = require("../models/Question");
const User = require("../models/User");
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
        // Use BASE_URL if available (for Railway/deployment), otherwise relative path
        const baseUrl = process.env.BASE_URL || process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
          : '';
        imageUrl = baseUrl 
          ? `${baseUrl}/uploads/questions/${req.file.filename}`
          : `/uploads/questions/${req.file.filename}`;
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
 * Query params: categoryId (optional) - filter by category
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

/**
 * PUT /admin/questions/:id
 * Update a question (Admin only)
 * Body: { categoryId, question (Uzbek), options: [{text: string, isCorrect: boolean}] }
 * Optional: image file (multipart/form-data)
 */
router.put(
  "/questions/:id",
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, question, options } = req.body;

      // Find question
      const existingQuestion = await Question.findById(id);
      if (!existingQuestion) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      // Validate input
      if (!categoryId || !question || !options) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Please provide categoryId, question (in Uzbek), and options (in Uzbek)",
        });
      }

      // Parse options
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

      // Translate question and options
      console.log("🔄 Translating updated question and options...");
      const translated = await translateQuestion(question, optionsArray);

      // Handle image
      let imageUrl = existingQuestion.image; // Keep existing image by default
      if (req.file) {
        // Delete old image if exists
        if (existingQuestion.image) {
          const oldImagePath = path.join(
            __dirname,
            "../../uploads/questions",
            path.basename(existingQuestion.image)
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (unlinkError) {
            console.error("Error deleting old image:", unlinkError);
          }
        }
        // Use BASE_URL if available (for Railway/deployment), otherwise relative path
        const baseUrl = process.env.BASE_URL || process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
          : '';
        imageUrl = baseUrl 
          ? `${baseUrl}/uploads/questions/${req.file.filename}`
          : `/uploads/questions/${req.file.filename}`;
      }

      // Update question
      existingQuestion.categoryId = categoryId;
      existingQuestion.question = translated.question;
      existingQuestion.options = translated.options;
      existingQuestion.image = imageUrl;

      await existingQuestion.save();

      console.log("✅ Question updated successfully");

      res.status(200).json({
        success: true,
        message: "Question updated successfully",
        question: {
          id: existingQuestion._id,
          categoryId: existingQuestion.categoryId,
          question: existingQuestion.question,
          options: existingQuestion.options,
          image: existingQuestion.image,
          updatedAt: existingQuestion.updatedAt,
        },
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Error updating question",
        error: error.message,
      });
    }
  }
);

/**
 * DELETE /admin/questions/:id
 * Delete a question (Admin only)
 */
router.delete("/questions/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Delete image file if exists
    if (question.image) {
      const imagePath = path.join(
        __dirname,
        "../../uploads/questions",
        path.basename(question.image)
      );
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (unlinkError) {
        console.error("Error deleting image file:", unlinkError);
      }
    }

    // Delete question
    await Question.findByIdAndDelete(id);

    console.log("✅ Question deleted successfully");

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting question",
      error: error.message,
    });
  }
});

/**
 * GET /admin/users/:id
 * Get user by ID (Admin only)
 */
router.get("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        status: user.status,
        mode: user.mode,
        correctAnswers: user.correctAnswers,
        language: user.language,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

/**
 * PUT /admin/users/:id/mode
 * Update user mode (Admin only)
 * Body: { mode: "oddiy" | "premium" }
 */
router.put("/users/:id/mode", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    // Validate mode
    if (!mode || !["oddiy", "premium"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be either 'oddiy' or 'premium'",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.mode = mode;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User mode updated to ${mode}`,
      user: {
        id: user._id,
        nickname: user.nickname,
        mode: user.mode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user mode",
      error: error.message,
    });
  }
});

module.exports = router;

