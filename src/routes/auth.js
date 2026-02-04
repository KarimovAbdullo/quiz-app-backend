const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Category = require("../models/Category");
const Question = require("../models/Question");
const AppConfig = require("../models/AppConfig");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

async function getAppVersion() {
  const doc = await AppConfig.findOne({ key: "appVersion" });
  return doc && doc.value ? doc.value : "1.0.0";
}

const uploadAvatarsDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(uploadAvatarsDir)) {
  fs.mkdirSync(uploadAvatarsDir, { recursive: true });
}
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadAvatarsDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      return cb(new Error("Invalid image type"), "");
    }
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});
function getBaseUrl() {
  return (
    process.env.BASE_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : null) ||
    "https://quiz-app-backend-production-cd1c.up.railway.app"
  );
}
function toAvatarUrl(filename) {
  if (!filename) return null;
  const base = getBaseUrl().replace(/\/$/, "");
  return filename.startsWith("http")
    ? filename
    : `${base}/uploads/avatars/${path.basename(filename)}`;
}

// Map stored mode to English for API response
const modeToEnglish = (m) => (m === "oddiy" || m === "premium" ? (m === "premium" ? "vip" : "free") : m);
// Level by correctAnswers: <50 beginner, 50-99 smart, 100-199 very_smart, 200+ genius
function getLevelFromCorrectAnswers(n) {
  if (n >= 200) return "genius";
  if (n >= 100) return "very_smart";
  if (n >= 50) return "smart";
  return "beginner";
}

/**
 * POST /auth/register
 * Register a new user
 * Body: { email, password, nickname }
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, nickname, language } = req.body;

    // Validate input
    if (!email || !password || !nickname) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and nickname",
      });
    }

    // Map language codes: uzb → uz, rus → ru, eng → en (for backward compatibility)
    let normalizedLanguage = language || "uz";
    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };
    
    if (language) {
      normalizedLanguage = languageMap[language] || language;
      if (!["uz", "ru", "en"].includes(normalizedLanguage)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language. Must be: uz, ru, en (or uzb, rus, eng)",
        });
      }
    }

    // Normalize email: trim + lowercase so one email = one user
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    // Check if user already exists (email must be unique)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      nickname,
      language: normalizedLanguage, // Default to "uz" (Uzbek)
      solvedQuestions: [],
      level: "beginner",
      mode: "oddiy",
      correctAnswers: 0,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success response with token
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: toAvatarUrl(user.avatar),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

/**
 * POST /auth/login
 * Login existing user
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email (same normalization as register)
    const normalizedEmail = (email || "").trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: toAvatarUrl(user.avatar),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

/**
 * POST /auth/admin/login
 * Admin login
 * Body: { login, password }
 * Admin credentials: login=admin1994, password=Abdu@1994
 */
router.post("/admin/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide login and password",
      });
    }

    // Check admin credentials
    const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin1994";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Abdu@1994";

    if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      { role: "admin", login: ADMIN_LOGIN },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Return success response with token
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        login: ADMIN_LOGIN,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in as admin",
      error: error.message,
    });
  }
});

/**
 * GET /auth/profile
 * Get current user's profile
 * Protected route (JWT required)
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate necessary fields
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sync level from correctAnswers if needed (beginner / smart / very_smart / genius)
    const expectedLevel = getLevelFromCorrectAnswers(user.correctAnswers || 0);
    if (user.level !== expectedLevel) {
      user.level = expectedLevel;
      await user.save();
    }

    // Category progress: how many correct per category
    const categories = await Category.find().sort({ order: 1 });
    const categoryProgress = [];
    for (const cat of categories) {
      const correctCount = await Question.countDocuments({
        _id: { $in: user.correctlySolvedQuestions || [] },
        categoryId: cat._id,
      });
      categoryProgress.push({
        categoryId: cat._id,
        categoryName: cat.name,
        correctCount,
      });
    }

    // Map language code if needed (uzb → uz, rus → ru, eng → en)
    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };
    const userLanguage = languageMap[user.language] || user.language || "uz";
    const version = await getAppVersion();

    // Return profile data (mode, level, version)
    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: toAvatarUrl(user.avatar),
        level: user.level || "beginner",
        mode: modeToEnglish(user.mode),
        allMode: user.allMode === true,
        correctAnswers: user.correctAnswers,
        solvedQuestionsCount: user.solvedQuestions.length,
        language: userLanguage,
        categoryProgress,
        version,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
});

/**
 * PUT /auth/profile
 * Update profile: nickname and/or avatar (image file).
 * Protected route (JWT required).
 * Body: multipart/form-data with optional "nickname" (string) and optional "avatar" (image file).
 */
router.put(
  "/profile",
  authMiddleware,
  (req, res, next) => {
    uploadAvatar.single("avatar")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid file",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const nickname = req.body.nickname;
      if (nickname !== undefined) {
        const trimmed = (typeof nickname === "string" ? nickname : "").trim();
        if (!trimmed) {
          return res.status(400).json({
            success: false,
            message: "Nickname cannot be empty",
          });
        }
        user.nickname = trimmed;
      }

      if (req.file) {
        if (user.avatar) {
          const oldFilename = user.avatar.includes("/")
            ? path.basename(user.avatar)
            : user.avatar;
          const oldPath = path.join(uploadAvatarsDir, oldFilename);
          try {
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          } catch (e) {
            console.warn("Could not delete old avatar:", e.message);
          }
        }
        user.avatar = req.file.filename;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          avatar: toAvatarUrl(user.avatar),
          level: user.level || "beginner",
          mode: modeToEnglish(user.mode),
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error.message,
      });
    }
  }
);

/**
 * PUT /auth/allMode
 * Set battle mode: when true, GET /questions/:categoryId returns ALL questions (including already correctly answered).
 * Protected route (JWT required)
 * Body: { allMode: true | false }
 */
router.put("/allMode", authMiddleware, async (req, res) => {
  try {
    const { allMode } = req.body;
    const userId = req.user._id;

    if (typeof allMode !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide allMode as boolean (true or false)",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.allMode = allMode;
    await user.save();

    res.status(200).json({
      success: true,
      message: allMode ? "Battle mode on: all questions will be shown" : "Normal mode: only unsolved questions will be shown",
      allMode: user.allMode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating allMode",
      error: error.message,
    });
  }
});

/**
 * PUT /auth/language
 * Update user's language preference (Alternative endpoint)
 * Protected route (JWT required)
 * Body: { language: "uz" | "ru" | "en" | "uzb" | "rus" | "eng" }
 */
router.put("/language", authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user._id;

    // Map language codes: uzb → uz, rus → ru, eng → en (for backward compatibility)
    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Please provide a language: uz, ru, en (or uzb, rus, eng)",
      });
    }

    const normalizedLanguage = languageMap[language] || language;

    // Validate language
    if (!["uz", "ru", "en"].includes(normalizedLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Must be: uz, ru, en (or uzb, rus, eng)",
      });
    }

    // Update user's language
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.language = normalizedLanguage;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Language updated successfully",
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating language",
      error: error.message,
    });
  }
});

/**
 * PATCH /auth/profile/language
 * Update user's language preference
 * Protected route (JWT required)
 * Body: { language: "uzb" | "rus" | "eng" }
 */
router.patch("/profile/language", authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user._id;

    // Map language codes: uzb → uz, rus → ru, eng → en (for backward compatibility)
    const languageMap = {
      "uzb": "uz",
      "rus": "ru",
      "eng": "en",
      "uz": "uz",
      "ru": "ru",
      "en": "en",
    };

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Please provide a language: uz, ru, en (or uzb, rus, eng)",
      });
    }

    const normalizedLanguage = languageMap[language] || language;

    // Validate language
    if (!["uz", "ru", "en"].includes(normalizedLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Must be: uz, ru, en (or uzb, rus, eng)",
      });
    }

    // Update user's language
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.language = normalizedLanguage;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Language updated successfully",
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating language",
      error: error.message,
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (invalidate token on server side if needed)
 * Protected route (JWT required)
 */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
});

module.exports = router;
