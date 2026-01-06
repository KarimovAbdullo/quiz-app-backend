const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

/**
 * GET /categories
 * Get all categories
 * Public endpoint (no authentication required)
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

module.exports = router;
