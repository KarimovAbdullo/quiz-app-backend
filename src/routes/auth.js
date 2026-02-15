const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

/**
 * POST /auth/admin/login
 * Admin login (yagona auth endpoint — user login/register yo'q)
 * Body: { login, password }
 */
router.post("/admin/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide login and password",
      });
    }

    const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin1994";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Abdu@1994";

    if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      { role: "admin", login: ADMIN_LOGIN },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { login: ADMIN_LOGIN, role: "admin" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in as admin",
      error: error.message,
    });
  }
});

module.exports = router;
