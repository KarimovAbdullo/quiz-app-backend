const mongoose = require("mongoose");
require("dotenv").config();
const { execSync } = require("child_process");
const path = require("path");

const Category = require("../src/models/Category");

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    importAllQuestions();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function importAllQuestions() {
  try {
    console.log("\n🔄 Barcha savollarni import qilish...\n");

    // Kategoriyalarni topish
    const movies = await Category.findOne({ "name.en": "Movies" });
    const logical = await Category.findOne({ "name.en": "Logical" });
    const games = await Category.findOne({ "name.en": "Games" });

    if (!movies || !logical || !games) {
      console.error("❌ Kategoriyalar topilmadi! Avval kategoriyalarni yarating:");
      console.log("   node scripts/setupDatabase.js");
      process.exit(1);
    }

    const imports = [
      {
        file: "questions/movies-new.json",
        categoryId: movies._id.toString(),
        name: "Movies",
      },
      {
        file: "questions/logical.json",
        categoryId: logical._id.toString(),
        name: "Logical",
      },
      {
        file: "questions/games.json",
        categoryId: games._id.toString(),
        name: "Games",
      },
    ];

    console.log("📋 Import qilinadigan fayllar:");
    imports.forEach((imp) => {
      console.log(`   - ${imp.name}: ${imp.file}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("🔄 Import jarayoni boshlanmoqda...\n");

    for (const imp of imports) {
      try {
        console.log(`\n📦 ${imp.name} kategoriyasi...`);
        const command = `node scripts/importQuestionsFromJSON.js "${imp.file}" ${imp.categoryId}`;
        execSync(command, { stdio: "inherit", cwd: process.cwd() });
        console.log(`✅ ${imp.name} kategoriyasi tayyor!\n`);
      } catch (error) {
        console.error(`❌ ${imp.name} kategoriyasida xatolik:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ BARCHA SAVOLLAR IMPORT QILINDI!");
    console.log("=".repeat(60));

    // Natijalarni ko'rsatish
    const Question = require("../src/models/Question");
    const moviesCount = await Question.countDocuments({ categoryId: movies._id });
    const logicalCount = await Question.countDocuments({ categoryId: logical._id });
    const gamesCount = await Question.countDocuments({ categoryId: games._id });
    const totalCount = await Question.countDocuments();

    console.log("\n📊 Import natijalari:");
    console.log(`   Movies: ${moviesCount} ta savol`);
    console.log(`   Logical: ${logicalCount} ta savol`);
    console.log(`   Games: ${gamesCount} ta savol`);
    console.log(`   Jami: ${totalCount} ta savol`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
