const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("../src/models/Category");
const Question = require("../src/models/Question");

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    setupDatabase();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function setupDatabase() {
  try {
    console.log("\n🔄 Baza sozlanmoqda...\n");

    // 1. Kategoriyalarni yaratish
    console.log("📁 Kategoriyalarni yaratish...\n");

    const categories = [
      { name: { uz: "Kinolar", ru: "Фильмы", en: "Movies" }, order: 1 },
      { name: { uz: "Mantiq", ru: "Логика", en: "Logical" }, order: 2 },
      { name: { uz: "Futbol", ru: "Футбол", en: "Football" }, order: 3 },
      { name: { uz: "Geografiya", ru: "География", en: "Geographical" }, order: 4 },
      { name: { uz: "O'yinlar", ru: "Игры", en: "Games" }, order: 5 },
      { name: { uz: "MMA", ru: "ММА", en: "MMA" }, order: 6 },
    ];

    const createdCategories = {};

    for (const catData of categories) {
      let category = await Category.findOne({ "name.en": catData.name.en });
      
      if (!category) {
        category = await Category.create(catData);
        console.log(`✅ ${catData.name.en} kategoriyasi yaratildi (ID: ${category._id})`);
      } else {
        // Order yangilash
        if (category.order !== catData.order) {
          category.order = catData.order;
          await category.save();
        }
        console.log(`ℹ️  ${catData.name.en} kategoriyasi allaqachon mavjud (ID: ${category._id})`);
      }
      
      createdCategories[catData.name.en] = category._id.toString();
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Kategoriyalar tayyor!");
    console.log("=".repeat(60));
    console.log("\n📋 Kategoriya ID lar:");
    Object.keys(createdCategories).forEach((name) => {
      console.log(`   ${name}: ${createdCategories[name]}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("📝 Keyingi qadamlar:");
    console.log("=".repeat(60));
    console.log("\nSavollarni import qilish uchun:");
    console.log(`   node scripts/importQuestionsFromJSON.js questions/movies-new.json ${createdCategories.Movies}`);
    console.log(`   node scripts/importQuestionsFromJSON.js questions/logical.json ${createdCategories.Logical}`);
    console.log(`   node scripts/importQuestionsFromJSON.js questions/games.json ${createdCategories.Games}`);
    console.log("\nYoki barchasini bir vaqtda import qilish uchun:");
    console.log("   node scripts/importAllQuestions.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
