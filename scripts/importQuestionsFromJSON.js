const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import models
const Category = require("../src/models/Category");
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
    importQuestions();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

/**
 * JSON fayldan savollarni import qilish
 * 
 * Foydalanish:
 * 1. JSON fayl yarating (questions-template.json ga qarang)
 * 2. Bu skriptni ishga tushiring:
 *    node scripts/importQuestionsFromJSON.js questions/movies.json
 * 
 * Yoki fayl yo'lini o'zgartiring:
 */
async function importQuestions() {
  try {
    // ============================================
    // BU YERNI O'ZGARTIRING - JSON fayl yo'li
    // ============================================
    const jsonFilePath = process.argv[2] || "questions/movies.json";
    
    // JSON faylni o'qish
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ JSON fayl topilmadi: ${jsonFilePath}`);
      console.log("\n📝 Qo'llanma:");
      console.log("1. questions/ papkasini yarating");
      console.log("2. movies.json faylini yarating (questions-template.json ga qarang)");
      console.log("3. Skriptni ishga tushiring: node scripts/importQuestionsFromJSON.js questions/movies.json");
      process.exit(1);
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

    if (!Array.isArray(jsonData)) {
      console.error("❌ JSON fayl array formatida bo'lishi kerak!");
      process.exit(1);
    }

    console.log(`\n📋 JSON fayldan ${jsonData.length} ta savol topildi`);

    // Kategoriyalarni ko'rsatish
    const categories = await Category.find().sort({ order: 1 });
    console.log("\n📂 Mavjud kategoriyalar:");
    categories.forEach((cat, idx) => {
      const name = cat.name?.uz || cat.name?.en || cat.name || "Noma'lum";
      console.log(`   ${idx + 1}. ${name} (ID: ${cat._id})`);
    });

    // Kategoriya ID ni so'rash yoki argumentdan olish
    let categoryId = process.argv[3]; // 3-chi argument kategoriya ID
    
    if (!categoryId) {
      // Agar argument berilmagan bo'lsa, fayl nomiga qarab kategoriya topish
      const fileName = path.basename(jsonFilePath, '.json');
      let categoryName = null;
      
      // Fayl nomiga qarab kategoriya nomini aniqlash
      if (fileName.includes('games') || fileName.includes('game')) {
        // Avval "Games" ni topishga harakat qilish, keyin "Game"
        let foundCategory = await Category.findOne({ "name.en": "Games" });
        if (!foundCategory) {
          foundCategory = await Category.findOne({ "name.en": "Game" });
        }
        if (foundCategory) {
          categoryId = foundCategory._id.toString();
          console.log(`\n✅ "${foundCategory.name.en}" kategoriyasi topildi: ${categoryId}`);
        } else {
          console.error("\n❌ 'Games' yoki 'Game' kategoriyasi topilmadi!");
          console.log("ℹ️  Kategoriya ID ni ko'rsating: node scripts/importQuestionsFromJSON.js questions/games.json <categoryId>");
          process.exit(1);
        }
        categoryName = null; // categoryName ni null qilish, chunki allaqachon topildi
      } else if (fileName.includes('movies') || fileName.includes('movie')) {
        categoryName = { "name.en": "Movies" };
      } else if (fileName.includes('science')) {
        categoryName = { "name.en": "Science" };
      } else if (fileName.includes('football')) {
        categoryName = { "name.en": "Football" };
      } else if (fileName.includes('mma')) {
        categoryName = { "name.en": "MMA" };
      } else if (fileName.includes('music')) {
        categoryName = { "name.en": "Music" };
      }
      
      if (categoryName) {
        const foundCategory = await Category.findOne(categoryName);
        if (foundCategory) {
          categoryId = foundCategory._id.toString();
          console.log(`\n✅ "${foundCategory.name.en}" kategoriyasi topildi: ${categoryId}`);
        } else {
          console.error(`\n❌ '${categoryName["name.en"]}' kategoriyasi topilmadi!`);
          console.log("ℹ️  Kategoriya ID ni ko'rsating: node scripts/importQuestionsFromJSON.js questions/games.json <categoryId>");
          process.exit(1);
        }
      } else if (!categoryId) {
        console.error("\n❌ Kategoriya aniqlanmadi!");
        console.log("ℹ️  Kategoriya ID ni ko'rsating: node scripts/importQuestionsFromJSON.js questions/games.json <categoryId>");
        process.exit(1);
      }
    }

    // Kategoriya mavjudligini tekshirish
    const category = await Category.findById(categoryId);
    if (!category) {
      console.error(`❌ Kategoriya topilmadi! ID: ${categoryId}`);
      process.exit(1);
    }

    console.log(`\n📁 Kategoriya: ${category.name.uz} / ${category.name.ru} / ${category.name.en}`);
    console.log(`\n🔄 Savollar import qilinmoqda...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Har bir savolni tekshirish va qo'shish
    for (let i = 0; i < jsonData.length; i++) {
      const questionData = jsonData[i];
      
      try {
        // Validatsiya
        if (!questionData.question || !questionData.options) {
          console.error(`❌ Savol ${i + 1}: question yoki options maydoni yo'q`);
          errorCount++;
          continue;
        }

        // Tillarni tekshirish
        if (!questionData.question.uz || !questionData.question.ru || !questionData.question.en) {
          console.error(`❌ Savol ${i + 1}: Barcha tillar (uz, ru, en) bo'lishi kerak`);
          errorCount++;
          continue;
        }

        // Variantlar sonini tekshirish
        if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
          console.error(`❌ Savol ${i + 1}: Aynan 4 ta variant bo'lishi kerak`);
          errorCount++;
          continue;
        }

        // Har bir variantni tekshirish
        let hasError = false;
        for (let j = 0; j < questionData.options.length; j++) {
          const option = questionData.options[j];
          if (!option.text || !option.text.uz || !option.text.ru || !option.text.en) {
            console.error(`❌ Savol ${i + 1}, Variant ${j + 1}: Barcha tillar (uz, ru, en) bo'lishi kerak`);
            hasError = true;
            break;
          }
          if (typeof option.isCorrect !== "boolean") {
            console.error(`❌ Savol ${i + 1}, Variant ${j + 1}: isCorrect boolean bo'lishi kerak`);
            hasError = true;
            break;
          }
        }

        if (hasError) {
          errorCount++;
          continue;
        }

        // To'g'ri javob sonini tekshirish
        const correctCount = questionData.options.filter((opt) => opt.isCorrect === true).length;
        if (correctCount !== 1) {
          console.error(`❌ Savol ${i + 1}: Aynan bitta variant to'g'ri bo'lishi kerak (hozir: ${correctCount})`);
          errorCount++;
          continue;
        }

        // Savol allaqachon mavjudligini tekshirish (question.uz ga qarab)
        const existingQuestion = await Question.findOne({
          categoryId: categoryId,
          "question.uz": questionData.question.uz,
        });

        if (existingQuestion) {
          console.log(`⏭️  Savol ${i + 1}: "${questionData.question.uz.substring(0, 50)}..." allaqachon mavjud, o'tkazib yuborildi`);
          skipCount++;
          continue;
        }

        // Savolni yaratish
        const newQuestion = new Question({
          categoryId: categoryId,
          question: {
            uz: questionData.question.uz,
            ru: questionData.question.ru,
            en: questionData.question.en,
          },
          options: questionData.options.map((opt) => ({
            text: {
              uz: opt.text.uz,
              ru: opt.text.ru,
              en: opt.text.en,
            },
            isCorrect: opt.isCorrect,
          })),
          image: questionData.image || null,
        });

        await newQuestion.save();
        successCount++;
        console.log(`✅ Savol ${i + 1}/${jsonData.length}: "${questionData.question.uz.substring(0, 50)}..." qo'shildi`);

      } catch (error) {
        console.error(`❌ Savol ${i + 1} xatosi:`, error.message);
        errorCount++;
      }
    }

    // Natijalar
    console.log("\n" + "=".repeat(50));
    console.log("📊 IMPORT NATIJALARI:");
    console.log("=".repeat(50));
    console.log(`✅ Muvaffaqiyatli qo'shildi: ${successCount}`);
    console.log(`⏭️  O'tkazib yuborildi (mavjud): ${skipCount}`);
    console.log(`❌ Xatolar: ${errorCount}`);
    console.log(`📋 Jami: ${jsonData.length}`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
