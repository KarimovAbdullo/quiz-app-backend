const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Category = require("../src/models/Category");
const Question = require("../src/models/Question");
const User = require("../src/models/User");

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
    clearDatabase();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

/**
 * Barcha ma'lumotlarni o'chirish
 * 
 * ⚠️ OGOHLANTIRISH: Bu operatsiya qaytarib bo'lmaydi!
 * Barcha kategoriyalar, savollar va foydalanuvchilar o'chiriladi!
 */
async function clearDatabase() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("⚠️  OGOHLANTIRISH!");
    console.log("=".repeat(60));
    console.log("Bu operatsiya barcha ma'lumotlarni o'chiradi:");
    console.log("  - Barcha kategoriyalar");
    console.log("  - Barcha savollar");
    console.log("  - Barcha foydalanuvchilar");
    console.log("\n⚠️  Bu operatsiya qaytarib bo'lmaydi!");
    console.log("=".repeat(60));

    // Ma'lumotlarni ko'rsatish
    const categoriesCount = await Category.countDocuments();
    const questionsCount = await Question.countDocuments();
    const usersCount = await User.countDocuments();

    console.log("\n📊 Hozirgi ma'lumotlar:");
    console.log(`   - Kategoriyalar: ${categoriesCount}`);
    console.log(`   - Savollar: ${questionsCount}`);
    console.log(`   - Foydalanuvchilar: ${usersCount}`);

    // Argument orqali tasdiqlash (--yes yoki --confirm)
    const args = process.argv.slice(2);
    const isConfirmed = args.includes("--yes") || args.includes("--confirm") || args.includes("-y");

    if (!isConfirmed) {
      console.log("\n❓ Barcha ma'lumotlarni o'chirishni tasdiqlash uchun:");
      console.log("   node scripts/clearDatabase.js --yes");
      console.log("\n⚠️  Yoki interaktiv rejimda:");
      console.log("   node scripts/clearDatabase.js");
      process.exit(0);
    }

    console.log("\n🔄 Ma'lumotlar o'chirilmoqda...\n");

    // Barcha ma'lumotlarni o'chirish
    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ ${deletedCategories.deletedCount} ta kategoriya o'chirildi`);

    const deletedQuestions = await Question.deleteMany({});
    console.log(`✅ ${deletedQuestions.deletedCount} ta savol o'chirildi`);

    const deletedUsers = await User.deleteMany({});
    console.log(`✅ ${deletedUsers.deletedCount} ta foydalanuvchi o'chirildi`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ BAZA TO'LIQ TOZALANDI!");
    console.log("=".repeat(60));
    console.log("\n📝 Endi siz:");
    console.log("   1. Kategoriyalarni qayta yaratishingiz kerak");
    console.log("   2. Savollarni qayta import qilishingiz kerak");
    console.log("   3. Foydalanuvchilar yangi ro'yxatdan o'tishadi");
    console.log("\n💡 Maslahat: Kategoriyalarni yaratish uchun:");
    console.log("   node scripts/reorderCategories.js");
    console.log("\n💡 Maslahat: Savollarni import qilish uchun:");
    console.log("   node scripts/importQuestionsFromJSON.js questions/movies-new.json <categoryId>");
    console.log("   node scripts/importQuestionsFromJSON.js questions/logical.json <categoryId>");
    console.log("   node scripts/importQuestionsFromJSON.js questions/games.json <categoryId>");
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
