const mongoose = require("mongoose");
require("dotenv").config();

// Import Question model
const Question = require("../src/models/Question");

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    deleteAllQuestions();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function deleteAllQuestions() {
  try {
    console.log("🔄 Deleting all questions...");

    // Count questions before deletion
    const countBefore = await Question.countDocuments();
    console.log(`📊 Found ${countBefore} questions in database`);

    if (countBefore === 0) {
      console.log("ℹ️  No questions to delete");
      process.exit(0);
    }

    // Delete all questions
    const result = await Question.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} questions successfully!`);
    console.log("✅ All questions have been removed. You can now add new questions via admin panel.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting questions:", error);
    process.exit(1);
  }
}
