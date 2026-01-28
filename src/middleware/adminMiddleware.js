const jwt = require("jsonwebtoken");

/**
 * Middleware to verify admin JWT token
 * Admin credentials: login=admin1994, password=Abdu@1994
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No admin token provided",
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Admin authentication error",
      error: error.message,
    });
  }
};

module.exports = adminMiddleware;

