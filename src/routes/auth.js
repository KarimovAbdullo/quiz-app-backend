const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      nickname,
      language: normalizedLanguage, // Default to "uz" (Uzbek)
      solvedQuestions: [],
      status: "boshlang'ich",
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

    // Find user by email
    const user = await User.findOne({ email });
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

    // Calculate status based on correctAnswers
    let calculatedStatus = user.status;
    if (user.correctAnswers >= 51) {
      calculatedStatus = "super daxo";
    } else if (user.correctAnswers >= 11) {
      calculatedStatus = "super";
    } else {
      calculatedStatus = "boshlang'ich";
    }

    // Update status if it changed
    if (user.status !== calculatedStatus) {
      user.status = calculatedStatus;
      await user.save();
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

    // Return profile data
    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        status: user.status,
        mode: user.mode,
        correctAnswers: user.correctAnswers,
        solvedQuestionsCount: user.solvedQuestions.length,
        language: userLanguage, // Normalized language code (uz, ru, en)
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

module.exports = router;
