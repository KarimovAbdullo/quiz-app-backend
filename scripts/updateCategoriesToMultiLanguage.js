const mongoose = require("mongoose");
require("dotenv").config();

// Import Category model
const Category = require("../src/models/Category");

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
    updateCategories();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Category name translations
const categoryTranslations = {
  Movies: {
    uz: "Kinolar",
    ru: "Фильмы",
    en: "Movies",
  },
  Logical: {
    uz: "Mantiq",
    ru: "Логика",
    en: "Logical",
  },
  Geographical: {
    uz: "Geografiya",
    ru: "География",
    en: "Geographical",
  },
  Science: {
    uz: "Mantiq",
    ru: "Логика",
    en: "Logical",
  },
  Game: {
    uz: "Geografiya",
    ru: "География",
    en: "Geographical",
  },
  Games: {
    uz: "Geografiya",
    ru: "География",
    en: "Geographical",
  },
  Football: {
    uz: "Futbol",
    ru: "Футбол",
    en: "Football",
  },
  MMA: {
    uz: "MMA",
    ru: "ММА",
    en: "MMA",
  },
  Music: {
    uz: "Musiqa",
    ru: "Музыка",
    en: "Music",
  },
};

async function updateCategories() {
  try {
    console.log("🔄 Updating categories to multi-language format...");

    const categories = await Category.find();

    for (const category of categories) {
      // Check if category.name is already an object (new format)
      if (typeof category.name === "object" && category.name.uz) {
        console.log(
          `ℹ️  Category ${category._id} already has multi-language format, skipping...`
        );
        continue;
      }

      // If category.name is a string (old format), convert it
      if (typeof category.name === "string") {
        const oldName = category.name;
        const translations = categoryTranslations[oldName];

        if (translations) {
          category.name = translations;
          await category.save();
          console.log(
            `✅ Updated category: "${oldName}" → uz: "${translations.uz}", ru: "${translations.ru}", en: "${translations.en}"`
          );
        } else {
          console.log(
            `⚠️  No translation found for category: "${oldName}", keeping as is`
          );
          // Convert to multi-language format with same name for all languages
          category.name = {
            uz: oldName,
            ru: oldName,
            en: oldName,
          };
          await category.save();
          console.log(
            `✅ Updated category: "${oldName}" → using same name for all languages`
          );
        }
      }
    }

    console.log("✅ Category update completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating categories:", error);
    process.exit(1);
  }
}

