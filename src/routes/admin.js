const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const adminMiddleware = require("../middleware/adminMiddleware");
const Category = require("../models/Category");
const Question = require("../models/Question");
const AppConfig = require("../models/AppConfig");
const { translateQuestion } = require("../utils/translate");
const router = express.Router();

const APP_VERSION_KEY = "appVersion";
const DEFAULT_VERSION = "1.0.0";
const CASH_VALUE_KEY = "versionCashValue";
const SHOW_ADDS_KEY = "showADDS";
// Har bir ilova uchun alohida reklama (adminka da 3 ta toggle)
const SHOW_ADDS_KEYS = {
  quizApp: "showADDS_quizApp",
  CashValue: "showADDS_CashValue",
  SafeZone: "showADDS_SafeZone",
  prankApp: "showADDS_prankApp",
};

async function getAppVersion() {
  const doc = await AppConfig.findOne({ key: APP_VERSION_KEY });
  return doc && doc.value ? doc.value : DEFAULT_VERSION;
}

async function getCashConfig() {
  const [cashDoc, showDoc] = await Promise.all([
    AppConfig.findOne({ key: CASH_VALUE_KEY }),
    AppConfig.findOne({ key: SHOW_ADDS_KEY }),
  ]);
  const versionCashValue = cashDoc && cashDoc.value ? cashDoc.value : "";
  const showADDS =
    showDoc && typeof showDoc.value === "string"
      ? showDoc.value === "true"
      : false;
  return { versionCashValue, showADDS };
}

async function getConfigAD() {
  const keys = Object.values(SHOW_ADDS_KEYS);
  const docs = await AppConfig.find({ key: { $in: keys } });
  const map = {};
  docs.forEach((d) => { map[d.key] = d.value; });
  const toBool = (v) => v === "true" || v === true;
  return {
    showADDS_quizApp: toBool(map[SHOW_ADDS_KEYS.quizApp]),
    showADDS_CashValue: toBool(map[SHOW_ADDS_KEYS.CashValue]),
    showADDS_SafeZone: toBool(map[SHOW_ADDS_KEYS.SafeZone]),
    showADDS_prankApp: toBool(map[SHOW_ADDS_KEYS.prankApp]),
  };
}

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
        readyToWork: cat.readyToWork === true,
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
 * PATCH /admin/categories/:id
 * Update category (Admin only). Body: { readyToWork?: boolean }
 */
router.patch("/categories/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { readyToWork } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (typeof readyToWork === "boolean") {
      category.readyToWork = readyToWork;
      await category.save();
    }

    res.status(200).json({
      success: true,
      message: "Category updated",
      category: {
        id: category._id,
        name: category.name,
        order: category.order,
        readyToWork: category.readyToWork === true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
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
 * GET /admin/configAD
 * Har bir ilova uchun reklama (Admin only). Returns { showADDS_quizApp, showADDS_CashValue, showADDS_SafeZone, showADDS_prankApp }.
 */
router.get("/configAD", adminMiddleware, async (req, res) => {
  try {
    const config = await getConfigAD();
    res.status(200).json({
      success: true,
      ...config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching configAD",
      error: error.message,
    });
  }
});

/**
 * PUT /admin/configAD
 * Har bir ilova uchun reklama (Admin only). Body: { showADDS_quizApp?, showADDS_CashValue?, showADDS_SafeZone?, showADDS_prankApp? }
 */
router.put("/configAD", adminMiddleware, async (req, res) => {
  try {
    const { showADDS_quizApp, showADDS_CashValue, showADDS_SafeZone, showADDS_prankApp } = req.body;
    const updates = [
      [SHOW_ADDS_KEYS.quizApp, showADDS_quizApp],
      [SHOW_ADDS_KEYS.CashValue, showADDS_CashValue],
      [SHOW_ADDS_KEYS.SafeZone, showADDS_SafeZone],
      [SHOW_ADDS_KEYS.prankApp, showADDS_prankApp],
    ];
    for (const [key, value] of updates) {
      if (value !== undefined) {
        const bool = value === true || value === "true" || value === "1" || value === 1;
        await AppConfig.findOneAndUpdate(
          { key },
          { value: bool ? "true" : "false" },
          { new: true, upsert: true }
        );
      }
    }
    const config = await getConfigAD();
    res.status(200).json({
      success: true,
      message: "ConfigAD updated",
      ...config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating configAD",
      error: error.message,
    });
  }
});

const APP_VERSION_KEYS = {
  quizApp: "version_quizApp",
  CashValue: "version_CashValue",
  SafeZone: "version_SafeZone",
  prankApp: "version_prankApp",
};

/**
 * GET /admin/app-versions
 * QuizApp, CashValue, SafeZone, prankApp versiyalari (Admin only).
 */
router.get("/app-versions", adminMiddleware, async (req, res) => {
  try {
    const keys = Object.values(APP_VERSION_KEYS);
    const docs = await AppConfig.find({ key: { $in: keys } });
    const map = {};
    docs.forEach((d) => { map[d.key] = d.value || "1.0.0"; });
    res.status(200).json({
      success: true,
      quizApp: map[APP_VERSION_KEYS.quizApp] || "1.0.0",
      CashValue: map[APP_VERSION_KEYS.CashValue] || "1.0.0",
      SafeZone: map[APP_VERSION_KEYS.SafeZone] || "1.0.0",
      prankApp: map[APP_VERSION_KEYS.prankApp] || "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching app versions",
      error: error.message,
    });
  }
});

/**
 * PUT /admin/app-versions
 * QuizApp, CashValue, SafeZone, prankApp versiyalarni yangilash (Admin only).
 * Body: { quizApp?, CashValue?, SafeZone?, prankApp? }
 */
router.put("/app-versions", adminMiddleware, async (req, res) => {
  try {
    const { quizApp, CashValue, SafeZone, prankApp } = req.body;
    const updates = [
      [APP_VERSION_KEYS.quizApp, quizApp],
      [APP_VERSION_KEYS.CashValue, CashValue],
      [APP_VERSION_KEYS.SafeZone, SafeZone],
      [APP_VERSION_KEYS.prankApp, prankApp],
    ];
    for (const [key, value] of updates) {
      if (value !== undefined && value !== null) {
        await AppConfig.findOneAndUpdate(
          { key },
          { value: String(value).trim() },
          { new: true, upsert: true }
        );
      }
    }
    const keys = Object.values(APP_VERSION_KEYS);
    const docs = await AppConfig.find({ key: { $in: keys } });
    const map = {};
    docs.forEach((d) => { map[d.key] = d.value || "1.0.0"; });
    res.status(200).json({
      success: true,
      message: "App versions updated",
      quizApp: map[APP_VERSION_KEYS.quizApp] || "1.0.0",
      CashValue: map[APP_VERSION_KEYS.CashValue] || "1.0.0",
      SafeZone: map[APP_VERSION_KEYS.SafeZone] || "1.0.0",
      prankApp: map[APP_VERSION_KEYS.prankApp] || "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating app versions",
      error: error.message,
    });
  }
});

/**
 * GET /admin/version
 * Get current app version (Admin only). Same value returned to all users in GET /auth/profile.
 */
router.get("/version", adminMiddleware, async (req, res) => {
  try {
    const version = await getAppVersion();
    res.status(200).json({
      success: true,
      version,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching version",
      error: error.message,
    });
  }
});

/**
 * PUT /admin/version
 * Update app version (Admin only). All users will see this version in GET /auth/profile.
 * Body: { version: string }
 */
router.put("/version", adminMiddleware, async (req, res) => {
  try {
    const { version } = req.body;
    if (version === undefined || version === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide version (string)",
      });
    }
    const value = String(version).trim();
    const doc = await AppConfig.findOneAndUpdate(
      { key: APP_VERSION_KEY },
      { value },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      message: "Version updated successfully",
      version: doc.value,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating version",
      error: error.message,
    });
  }
});

/**
 * GET /admin/cash-config
 * Get global cash/ad config for all apps (Admin only).
 * Returns { versionCashValue, showADDS }.
 */
router.get("/cash-config", adminMiddleware, async (req, res) => {
  try {
    const config = await getCashConfig();
    res.status(200).json({
      success: true,
      ...config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cash config",
      error: error.message,
    });
  }
});

/**
 * PUT /admin/cash-config
 * Update global cash/ad config (Admin only).
 * Body: { versionCashValue?: string|number, showADDS?: boolean }
 */
router.put("/cash-config", adminMiddleware, async (req, res) => {
  try {
    const { versionCashValue, showADDS } = req.body;

    if (versionCashValue !== undefined) {
      await AppConfig.findOneAndUpdate(
        { key: CASH_VALUE_KEY },
        { value: String(versionCashValue) },
        { new: true, upsert: true }
      );
    }

    if (showADDS !== undefined) {
      const bool =
        showADDS === true ||
        showADDS === "true" ||
        showADDS === "1" ||
        showADDS === 1;
      await AppConfig.findOneAndUpdate(
        { key: SHOW_ADDS_KEY },
        { value: bool ? "true" : "false" },
        { new: true, upsert: true }
      );
    }

    const config = await getCashConfig();
    res.status(200).json({
      success: true,
      message: "Cash config updated successfully",
      ...config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cash config",
      error: error.message,
    });
  }
});

module.exports = router;

