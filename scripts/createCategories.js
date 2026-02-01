const mongoose = require("mongoose");
require("dotenv").config();

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
    createCategories();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function createCategories() {
  try {
    console.log("🔄 Kategoriyalarni yaratish/yangilash...\n");

    // Logical kategoriya
    let logical = await Category.findOne({ "name.en": "Logical" });
    if (!logical) {
      logical = await Category.create({
        name: {
          uz: "Mantiq",
          ru: "Логика",
          en: "Logical",
        },
        order: 2,
      });
      console.log("✅ Logical kategoriya yaratildi:", logical._id);
    } else {
      // Yangilash kerak bo'lsa
      if (logical.order !== 2) {
        logical.order = 2;
        await logical.save();
        console.log("🔄 Logical kategoriya yangilandi (order: 2)");
      } else {
        console.log("ℹ️  Logical kategoriya allaqachon mavjud:", logical._id);
      }
    }

    // Geographical kategoriya
    let geographical = await Category.findOne({ "name.en": "Geographical" });
    if (!geographical) {
      geographical = await Category.create({
        name: {
          uz: "Geografiya",
          ru: "География",
          en: "Geographical",
        },
        order: 3,
      });
      console.log("✅ Geographical kategoriya yaratildi:", geographical._id);
    } else {
      // Yangilash kerak bo'lsa
      if (geographical.order !== 3) {
        geographical.order = 3;
        await geographical.save();
        console.log("🔄 Geographical kategoriya yangilandi (order: 3)");
      } else {
        console.log("ℹ️  Geographical kategoriya allaqachon mavjud:", geographical._id);
      }
    }

    // Science va Game kategoriyalarini o'chirish yoki order o'zgartirish
    const science = await Category.findOne({ "name.en": "Science" });
    if (science) {
      console.log("ℹ️  Science kategoriya mavjud (order:", science.order + ")");
      console.log("   Eslatma: Science kategoriyasi Logical bilan almashtirilishi kerak");
    }

    const game = await Category.findOne({ $or: [{ "name.en": "Game" }, { "name.en": "Games" }] });
    if (game) {
      console.log("ℹ️  Game/Games kategoriya mavjud (order:", game.order + ")");
      console.log("   Eslatma: Game kategoriyasi Geographical bilan almashtirilishi kerak");
    }

    // Barcha kategoriyalarni ko'rsatish
    console.log("\n📋 Barcha kategoriyalar:");
    const allCategories = await Category.find().sort({ order: 1 });
    allCategories.forEach((cat) => {
      const name = cat.name?.en || cat.name?.uz || cat.name || "Unknown";
      console.log(`   ${cat.order}. ${name} (ID: ${cat._id})`);
    });

    console.log("\n✅ Kategoriyalar tayyor!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }
}
