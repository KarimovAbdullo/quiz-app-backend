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
    reorderCategories();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function reorderCategories() {
  try {
    console.log("🔄 Kategoriyalarni qayta tartiblash...\n");

    // 1. Music va Science kategoriyalarini o'chirish (ID bo'yicha)
    console.log("🗑️  Music va Science kategoriyalarini o'chirish...");
    
    // Music: 69615a5e5d12268d68bb2c27
    const musicId = "69615a5e5d12268d68bb2c27";
    const music = await Category.findById(musicId);
    if (music) {
      const deletedQuestions = await Question.deleteMany({ categoryId: music._id });
      console.log(`   ✅ Music kategoriyasi o'chirildi (${deletedQuestions.deletedCount} ta savol bilan)`);
      await Category.findByIdAndDelete(music._id);
    } else {
      console.log("   ℹ️  Music kategoriyasi topilmadi");
    }

    // Science: 69615a5c5d12268d68bb2c1a
    const scienceId = "69615a5c5d12268d68bb2c1a";
    const science = await Category.findById(scienceId);
    if (science) {
      const deletedQuestions = await Question.deleteMany({ categoryId: science._id });
      console.log(`   ✅ Science kategoriyasi o'chirildi (${deletedQuestions.deletedCount} ta savol bilan)`);
      await Category.findByIdAndDelete(science._id);
    } else {
      console.log("   ℹ️  Science kategoriyasi topilmadi");
    }

    // 2. Kategoriyalarni yangi tartibga o'tkazish (ID bo'yicha)
    console.log("\n📋 Kategoriyalarni yangi tartibga o'tkazish...\n");

    const categoryUpdates = [
      { id: "69615a5c5d12268d68bb2c17", name: "Movies", order: 1 },
      { id: "697cf3a38448f79965c43a74", name: "Logical", order: 2 },
      { id: "69615a5d5d12268d68bb2c21", name: "Football", order: 3 },
      { id: "697cf3a38448f79965c43a77", name: "Geographical", order: 4 },
      { id: "69615a5d5d12268d68bb2c1e", name: "Game", order: 5 },
      { id: "69615a5e5d12268d68bb2c24", name: "MMA", order: 6 },
    ];

    // Kategoriya nomlari
    const categoryNames = {
      Movies: { uz: "Kinolar", ru: "Фильмы", en: "Movies" },
      Logical: { uz: "Mantiq", ru: "Логика", en: "Logical" },
      Football: { uz: "Futbol", ru: "Футбол", en: "Football" },
      Geographical: { uz: "Geografiya", ru: "География", en: "Geographical" },
      Game: { uz: "O'yinlar", ru: "Игры", en: "Games" },
      MMA: { uz: "MMA", ru: "ММА", en: "MMA" },
    };

    for (const update of categoryUpdates) {
      const category = await Category.findById(update.id);
      
      if (category) {
        const oldOrder = category.order;
        category.order = update.order;
        
        // Name maydonini yangilash (agar bo'sh bo'lsa)
        const names = categoryNames[update.name];
        if (names && (!category.name || !category.name.en)) {
          category.name = names;
          console.log(`   📝 ${update.name} nomi yangilandi`);
        }
        
        await category.save();
        console.log(`   ✅ ${update.name}: order ${oldOrder} → ${update.order}`);
      } else {
        console.log(`   ⚠️  ${update.name} kategoriyasi topilmadi (ID: ${update.id})`);
      }
    }

    // 3. Barcha kategoriyalarni ko'rsatish
    console.log("\n📋 Yangilangan kategoriyalar ro'yxati:");
    const allCategories = await Category.find().sort({ order: 1 });
    allCategories.forEach((cat) => {
      const name = cat.name?.en || cat.name?.uz || cat.name || "Unknown";
      const questionsCount = 0; // Bu yerda count qilish mumkin, lekin tezroq bo'lishi uchun o'tkazib yuboramiz
      console.log(`   ${cat.order}. ${name} (ID: ${cat._id})`);
    });

    console.log("\n✅ Kategoriyalar muvaffaqiyatli qayta tartiblandi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
