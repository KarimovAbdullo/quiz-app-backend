const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Category = require("../src/models/Category");
const Question = require("../src/models/Question");
const { translateQuestion } = require("../src/utils/translate");

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
    addQuestion();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

/**
 * Qo'lda savol qo'shish funksiyasi
 * 
 * O'zgartirish kerak bo'lgan qismlar:
 * - categoryId: Kategoriya ID si (MongoDB ObjectId)
 * - questionUz: Savol matni o'zbek tilida
 * - options: 4 ta variant (bittasi to'g'ri bo'lishi kerak)
 * - image: Rasm URL (ixtiyoriy)
 */
async function addQuestion() {
  try {
    console.log("🔄 Adding question...");

    // ============================================
    // BU YERDA SAVOL MA'LUMOTLARINI O'ZGARTIRING
    // ============================================
    
    // 1. Kategoriya ID sini oling (avval barcha kategoriyalarni ko'rish uchun)
    // Agar kategoriya ID sini bilmasangiz, quyidagi kod kategoriyalarni ko'rsatadi:
    const categories = await Category.find().sort({ order: 1 });
    console.log("\n📋 Mavjud kategoriyalar:");
    categories.forEach((cat) => {
      console.log(`  - ID: ${cat._id}, Nomi: ${cat.name.uz} / ${cat.name.ru} / ${cat.name.en}`);
    });
    console.log("");

    // Kategoriya ID sini bu yerga yozing (masalan: "507f1f77bcf86cd799439011")
    const categoryId = "507f1f77bcf86cd799439011"; // <-- BU YERNI O'ZGARTIRING

    // 2. Savol matni (o'zbek tilida)
    const questionUz = "Bu yerda savol matnini yozing"; // <-- BU YERNI O'ZGARTIRING

    // 3. Variantlar (4 ta, bittasi to'g'ri bo'lishi kerak)
    const options = [
      { text: "Birinchi variant", isCorrect: false }, // <-- BU YERNI O'ZGARTIRING
      { text: "Ikkinchi variant", isCorrect: true },  // <-- BU YERNI O'ZGARTIRING (to'g'ri javob)
      { text: "Uchinchi variant", isCorrect: false }, // <-- BU YERNI O'ZGARTIRING
      { text: "To'rtinchi variant", isCorrect: false }, // <-- BU YERNI O'ZGARTIRING
    ];

    // 4. Rasm URL (ixtiyoriy, agar kerak bo'lsa)
    const imageUrl = null; // <-- BU YERNI O'ZGARTIRING (masalan: "https://example.com/image.jpg")

    // ============================================
    // VALIDATSIYA
    // ============================================

    // Kategoriya mavjudligini tekshirish
    const category = await Category.findById(categoryId);
    if (!category) {
      console.error(`❌ Kategoriya topilmadi! ID: ${categoryId}`);
      console.log("ℹ️  Yuqoridagi kategoriyalar ro'yxatidan to'g'ri ID ni tanlang");
      process.exit(1);
    }

    // Variantlar sonini tekshirish
    if (!Array.isArray(options) || options.length !== 4) {
      console.error("❌ Savol aynan 4 ta variantga ega bo'lishi kerak!");
      process.exit(1);
    }

    // To'g'ri javob sonini tekshirish
    const correctCount = options.filter((opt) => opt.isCorrect === true).length;
    if (correctCount !== 1) {
      console.error("❌ Aynan bitta variant to'g'ri bo'lishi kerak!");
      process.exit(1);
    }

    // ============================================
    // TARJIMA VA SAQLASH
    // ============================================

    console.log(`\n📝 Kategoriya: ${category.name.uz}`);
    console.log(`📝 Savol: ${questionUz}`);
    console.log(`📝 Variantlar:`);
    options.forEach((opt, idx) => {
      console.log(`   ${idx + 1}. ${opt.text} ${opt.isCorrect ? "✅ (to'g'ri)" : ""}`);
    });

    // Tarjima qilish (uz → ru, en)
    console.log("\n🔄 Tarjima qilinmoqda...");
    const translated = await translateQuestion(questionUz, options);

    // Savolni yaratish
    const newQuestion = new Question({
      categoryId,
      question: translated.question,
      options: translated.options,
      image: imageUrl,
    });

    await newQuestion.save();

    console.log("\n✅ Savol muvaffaqiyatli qo'shildi!");
    console.log(`📊 Savol ID: ${newQuestion._id}`);
    console.log("\n📋 Qo'shilgan savol:");
    console.log(`   O'zbek: ${newQuestion.question.uz}`);
    console.log(`   Rus: ${newQuestion.question.ru}`);
    console.log(`   Ingliz: ${newQuestion.question.en}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
