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

// Map stored mode to English for API response
const modeToEnglish = (m) => (m === "oddiy" || m === "premium" ? (m === "premium" ? "vip" : "free") : m);
const VALID_MODES = ["free", "vip"];
const VALID_LEVELS = ["beginner", "smart", "very_smart", "genius"];

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
        // Construct full URL for image
        // Priority: BASE_URL > RAILWAY_PUBLIC_DOMAIN > hardcoded Railway URL
        let baseUrl = process.env.BASE_URL;
        
        if (!baseUrl && process.env.RAILWAY_PUBLIC_DOMAIN) {
          baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
        }
        
        if (!baseUrl) {
          baseUrl = 'https://quiz-app-backend-production-cd1c.up.railway.app';
        }
        
        // Ensure baseUrl doesn't end with /
        baseUrl = baseUrl.replace(/\/$/, '');
        
        imageUrl = `${baseUrl}/uploads/questions/${req.file.filename}`;
        console.log(`📸 Image saved: ${imageUrl}`);
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
          images: newQuestion.images || undefined,
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
        images: q.images || undefined,
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
        // Construct full URL for image
        let baseUrl = process.env.BASE_URL;
        
        if (!baseUrl && process.env.RAILWAY_PUBLIC_DOMAIN) {
          baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
        }
        
        if (!baseUrl) {
          baseUrl = 'https://quiz-app-backend-production-cd1c.up.railway.app';
        }
        
        // Ensure baseUrl doesn't end with /
        baseUrl = baseUrl.replace(/\/$/, '');
        
        imageUrl = `${baseUrl}/uploads/questions/${req.file.filename}`;
        console.log(`📸 Image updated: ${imageUrl}`);
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
          images: existingQuestion.images || undefined,
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
 * GET /admin/users
 * Get all users (Admin only). Returns list without passwords; mode and level.
 */
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        nickname: u.nickname,
        level: u.level || "beginner",
        mode: modeToEnglish(u.mode),
        correctAnswers: u.correctAnswers,
        solvedQuestionsCount: (u.solvedQuestions || []).length,
        language: u.language,
        allMode: u.allMode === true,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

/**
 * GET /admin/users/:id
 * Get user by ID with full details and categoryProgress (Admin only). Password not returned; mode and level.
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

    // Category progress: correct count per category
    const categories = await Category.find().sort({ order: 1 });
    const categoryProgress = [];
    for (const cat of categories) {
      const correctCount = await Question.countDocuments({
        _id: { $in: user.correctlySolvedQuestions || [] },
        categoryId: cat._id,
      });
      const categoryName = typeof cat.name === "object" && cat.name ? cat.name.en : cat.name;
      categoryProgress.push({
        categoryId: cat._id,
        categoryName,
        correctCount,
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        level: user.level || "beginner",
        mode: modeToEnglish(user.mode),
        correctAnswers: user.correctAnswers,
        solvedQuestionsCount: (user.solvedQuestions || []).length,
        language: user.language,
        allMode: user.allMode === true,
        categoryProgress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
 * PUT /admin/users/:id
 * Update user mode and/or level (Admin only). Body: { mode?: "free" | "vip", level?: "beginner" | "smart" | "very_smart" | "genius" }
 */
router.put("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode, level } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (mode !== undefined) {
      if (!VALID_MODES.includes(mode)) {
        return res.status(400).json({
          success: false,
          message: `Mode must be one of: ${VALID_MODES.join(", ")}`,
        });
      }
      user.mode = mode;
    }
    if (level !== undefined) {
      if (!VALID_LEVELS.includes(level)) {
        return res.status(400).json({
          success: false,
          message: `Level must be one of: ${VALID_LEVELS.join(", ")}`,
        });
      }
      user.level = level;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        level: user.level || "beginner",
        mode: modeToEnglish(user.mode),
        correctAnswers: user.correctAnswers,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
});

module.exports = router;

