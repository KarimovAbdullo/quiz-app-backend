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
    const { email, password, nickname } = req.body;

    // Validate input
    if (!email || !password || !nickname) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and nickname",
      });
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

module.exports = router;
