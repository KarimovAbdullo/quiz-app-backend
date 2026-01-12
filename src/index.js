const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const questionRoutes = require("./routes/question");
const adminRoutes = require("./routes/admin");

// Import models for seed check
const Category = require("./models/Category");
const Question = require("./models/Question");

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (uploaded images)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  console.error("Please set MONGODB_URI in Railway Variables");
  process.exit(1);
}

// Routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/questions", questionRoutes);
app.use("/admin", adminRoutes);

// Health check endpoint (for Railway/deployment monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Quiz Backend API is running!",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login",
        profile: "GET /auth/profile",
        updateLanguage: "PATCH /auth/profile/language",
        adminLogin: "POST /auth/admin/login",
      },
      categories: {
        getAll: "GET /categories",
      },
      questions: {
        getByCategory: "GET /questions/:categoryId?language=uzb|rus|eng",
        submitAnswer: "POST /questions/answer",
      },
      admin: {
        getCategories: "GET /admin/categories",
        addQuestion: "POST /admin/questions (multipart/form-data)",
        getQuestions: "GET /admin/questions",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Start server first (Railway needs server to be listening immediately)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at http://0.0.0.0:${PORT}`);

  // Connect to MongoDB after server starts
  console.log("🔄 Connecting to MongoDB...");
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("✅ Connected to MongoDB successfully!");
      // Check if database needs seeding
      seedIfNeeded();
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error.message);
      // Server continues running even if MongoDB fails
    });
});

// Auto-seed function (runs only if database is empty)
// Creates only categories, questions should be added via admin panel
// Also updates existing categories to multi-language format if needed
async function seedIfNeeded() {
  try {
    const categoryCount = await Category.countDocuments();

    if (categoryCount === 0) {
      console.log("🔄 Database is empty. Creating categories...");
      await createCategoriesOnly();
    } else {
      console.log(`✅ Database already has ${categoryCount} categories`);
      // Update existing categories to multi-language format if needed
      await updateCategoriesToMultiLanguage();
    }
  } catch (error) {
    console.error("❌ Error checking categories:", error.message);
  }
}

// Create only categories (questions should be added via admin panel)
// Categories are created in multi-language format
async function createCategoriesOnly() {
  try {
    const categoriesData = [
      {
        name: {
          uz: "Kinolar",
          ru: "Фильмы",
          en: "Movies",
        },
        order: 1,
      },
      {
        name: {
          uz: "Fan",
          ru: "Наука",
          en: "Science",
        },
        order: 2,
      },
      {
        name: {
          uz: "O'yinlar",
          ru: "Игры",
          en: "Games",
        },
        order: 3,
      },
      {
        name: {
          uz: "Futbol",
          ru: "Футбол",
          en: "Football",
        },
        order: 4,
      },
      {
        name: {
          uz: "MMA",
          ru: "ММА",
          en: "MMA",
        },
        order: 5,
      },
      {
        name: {
          uz: "Musiqa",
          ru: "Музыка",
          en: "Music",
        },
        order: 6,
      },
    ];

    // Create categories
    for (const catData of categoriesData) {
      // Find by order (since name is now an object)
      let category = await Category.findOne({ order: catData.order });

      if (!category) {
        category = await Category.create(catData);
        console.log(
          `✅ Created category: ${category.name.uz} / ${category.name.ru} / ${category.name.en} (order: ${catData.order})`
        );
      } else {
        // Update name and order if needed
        let updated = false;
        if (
          typeof category.name !== "object" ||
          category.name.uz !== catData.name.uz ||
          category.name.ru !== catData.name.ru ||
          category.name.en !== catData.name.en
        ) {
          category.name = catData.name;
          updated = true;
        }
        if (category.order !== catData.order) {
          category.order = catData.order;
          updated = true;
        }
        if (updated) {
          await category.save();
          console.log(
            `🔄 Updated category: ${category.name.uz} / ${category.name.ru} / ${category.name.en} (order: ${catData.order})`
          );
        }
      }
    }

    console.log("✅ Categories created. Use admin panel to add questions.");
  } catch (error) {
    console.error("❌ Error creating categories:", error.message);
  }
}

// Update existing categories to multi-language format
async function updateCategoriesToMultiLanguage() {
  try {
    const categoryTranslations = {
      Movies: {
        uz: "Kinolar",
        ru: "Фильмы",
        en: "Movies",
      },
      Science: {
        uz: "Fan",
        ru: "Наука",
        en: "Science",
      },
      Game: {
        uz: "O'yinlar",
        ru: "Игры",
        en: "Games",
      },
      Games: {
        // Also handle "Games" (plural)
        uz: "O'yinlar",
        ru: "Игры",
        en: "Games",
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

    const categories = await Category.find();
    let updatedCount = 0;

    for (const category of categories) {
      // Check if category.name is already an object (new format)
      if (
        typeof category.name === "object" &&
        category.name !== null &&
        !Array.isArray(category.name) &&
        category.name.uz !== undefined &&
        category.name.ru !== undefined &&
        category.name.en !== undefined
      ) {
        // Already in multi-language format, but check if all fields are present
        if (!category.name.uz || !category.name.ru || !category.name.en) {
          console.log(
            `⚠️  Category ${category._id} has incomplete multi-language format, updating...`
          );
          // Will fall through to update
        } else {
          continue; // Already in multi-language format
        }
      }

      // If category.name is a string (old format), convert it
      if (typeof category.name === "string") {
        const oldName = category.name;
        const translations = categoryTranslations[oldName];

        if (translations) {
          category.name = translations;
          await category.save();
          updatedCount++;
          console.log(
            `✅ Updated category: "${oldName}" → uz: "${translations.uz}", ru: "${translations.ru}", en: "${translations.en}"`
          );
        } else {
          // No translation found, convert to multi-language with same name
          category.name = {
            uz: oldName,
            ru: oldName,
            en: oldName,
          };
          await category.save();
          updatedCount++;
          console.log(
            `⚠️  Updated category: "${oldName}" → using same name for all languages (no translation found)`
          );
        }
      } else if (
        typeof category.name === "object" &&
        category.name !== null &&
        (!category.name.uz || !category.name.ru || !category.name.en)
      ) {
        // Partial object - complete it
        const oldName =
          category.name.uz || category.name.en || category.name.ru || "Unknown";
        const translations = categoryTranslations[oldName];

        if (translations) {
          category.name = translations;
          await category.save();
          updatedCount++;
          console.log(
            `✅ Completed category: "${oldName}" → uz: "${translations.uz}", ru: "${translations.ru}", en: "${translations.en}"`
          );
        }
      }
    }

    if (updatedCount > 0) {
      console.log(
        `✅ Updated ${updatedCount} categories to multi-language format`
      );
    } else {
      console.log("✅ All categories are already in multi-language format");
    }
  } catch (error) {
    console.error("❌ Error updating categories:", error.message);
  }
}

// Old seed script removed - use admin panel to add questions
// This function is kept for reference but not used
async function runSeedScript_DEPRECATED() {
  try {
    const categoriesData = [
      { name: "Movies", order: 1 },
      { name: "Science", order: 2 },
      { name: "Game", order: 3 },
      { name: "Football", order: 4 },
      { name: "MMA", order: 5 },
      { name: "Music", order: 6 },
    ];

    const questionsData = {
      Movies: [
        {
          question:
            "Qaysi filmda 'May the Force be with you' degan gap aytiladi?",
          options: [
            { text: "Harry Potter", isCorrect: false },
            { text: "Star Wars", isCorrect: true },
            { text: "Lord of the Rings", isCorrect: false },
            { text: "Avengers", isCorrect: false },
          ],
        },
        {
          question: "Titanic filmida qaysi aktrisa bosh rolni o'ynagan?",
          options: [
            { text: "Angelina Jolie", isCorrect: false },
            { text: "Kate Winslet", isCorrect: true },
            { text: "Scarlett Johansson", isCorrect: false },
            { text: "Jennifer Lawrence", isCorrect: false },
          ],
        },
        {
          question: "Inception filmini kim yozgan va rejissyorlik qilgan?",
          options: [
            { text: "Steven Spielberg", isCorrect: false },
            { text: "Christopher Nolan", isCorrect: true },
            { text: "Martin Scorsese", isCorrect: false },
            { text: "Quentin Tarantino", isCorrect: false },
          ],
        },
        {
          question: "The Matrix filmida bosh qahramonning ismi nima?",
          options: [
            { text: "John Wick", isCorrect: false },
            { text: "Neo", isCorrect: true },
            { text: "Morpheus", isCorrect: false },
            { text: "Trinity", isCorrect: false },
          ],
        },
        {
          question: "Avengers: Endgame filmi qachon chiqgan?",
          options: [
            { text: "2018", isCorrect: false },
            { text: "2019", isCorrect: true },
            { text: "2020", isCorrect: false },
            { text: "2021", isCorrect: false },
          ],
        },
      ],
      Science: [
        {
          question: "Yer sayyorasi Quyosh atrofida necha marta aylanadi?",
          options: [
            { text: "365 marta", isCorrect: true },
            { text: "366 marta", isCorrect: false },
            { text: "364 marta", isCorrect: false },
            { text: "360 marta", isCorrect: false },
          ],
        },
        {
          question: "Su vodorod va kislorodning qaysi nisbatida hosil bo'ladi?",
          options: [
            { text: "H2O", isCorrect: true },
            { text: "H2O2", isCorrect: false },
            { text: "CO2", isCorrect: false },
            { text: "NaCl", isCorrect: false },
          ],
        },
        {
          question: "Eng kichik element qaysi?",
          options: [
            { text: "Vodorod", isCorrect: true },
            { text: "Geliy", isCorrect: false },
            { text: "Litiy", isCorrect: false },
            { text: "Uglerod", isCorrect: false },
          ],
        },
        {
          question: "Fotosintez jarayonida qaysi gaz chiqariladi?",
          options: [
            { text: "Kislorod", isCorrect: true },
            { text: "Uglerod dioksid", isCorrect: false },
            { text: "Azot", isCorrect: false },
            { text: "Vodorod", isCorrect: false },
          ],
        },
        {
          question: "Yer sayyorasi necha million yil oldin paydo bo'lgan?",
          options: [
            { text: "4.5 milliard", isCorrect: true },
            { text: "2.5 milliard", isCorrect: false },
            { text: "6.5 milliard", isCorrect: false },
            { text: "1.5 milliard", isCorrect: false },
          ],
        },
      ],
      Game: [
        {
          question: "Super Mario o'yinida bosh qahramonning ismi nima?",
          options: [
            { text: "Mario", isCorrect: true },
            { text: "Luigi", isCorrect: false },
            { text: "Bowser", isCorrect: false },
            { text: "Yoshi", isCorrect: false },
          ],
        },
        {
          question: "Minecraft o'yinida asosiy blok nima?",
          options: [
            { text: "Dirt", isCorrect: false },
            { text: "Stone", isCorrect: false },
            { text: "Grass Block", isCorrect: true },
            { text: "Wood", isCorrect: false },
          ],
        },
        {
          question: "Fortnite o'yinida qancha o'yinchi bir vaqtda o'ynaydi?",
          options: [
            { text: "50", isCorrect: false },
            { text: "100", isCorrect: true },
            { text: "150", isCorrect: false },
            { text: "200", isCorrect: false },
          ],
        },
        {
          question: "Pokemon o'yinida eng birinchi Pokemon qaysi?",
          options: [
            { text: "Pikachu", isCorrect: false },
            { text: "Bulbasaur", isCorrect: true },
            { text: "Charmander", isCorrect: false },
            { text: "Squirtle", isCorrect: false },
          ],
        },
        {
          question:
            "Call of Duty o'yinlar seriyasida qaysi jang maydoni eng mashhur?",
          options: [
            { text: "Nuketown", isCorrect: true },
            { text: "Rust", isCorrect: false },
            { text: "Shipment", isCorrect: false },
            { text: "Dome", isCorrect: false },
          ],
        },
      ],
      Football: [
        {
          question: "Futbol maydonida nechta o'yinchi bo'ladi?",
          options: [
            { text: "20", isCorrect: false },
            { text: "22", isCorrect: true },
            { text: "24", isCorrect: false },
            { text: "18", isCorrect: false },
          ],
        },
        {
          question: "FIFA Jahon chempionati necha yilda bir marta o'tkaziladi?",
          options: [
            { text: "2 yil", isCorrect: false },
            { text: "4 yil", isCorrect: true },
            { text: "3 yil", isCorrect: false },
            { text: "5 yil", isCorrect: false },
          ],
        },
        {
          question: "Qaysi klub 'Los Blancos' laqabi bilan tanilgan?",
          options: [
            { text: "Barcelona", isCorrect: false },
            { text: "Real Madrid", isCorrect: true },
            { text: "Manchester United", isCorrect: false },
            { text: "Bayern Munich", isCorrect: false },
          ],
        },
        {
          question: "Futbolda qizil kartochka qachon ko'rsatiladi?",
          options: [
            { text: "Jiddiy qoidabuzarlik", isCorrect: true },
            { text: "Oddiy qoidabuzarlik", isCorrect: false },
            { text: "Offside", isCorrect: false },
            { text: "Handball", isCorrect: false },
          ],
        },
        {
          question: "Eng ko'p gol urgan futbolchi kim?",
          options: [
            { text: "Lionel Messi", isCorrect: false },
            { text: "Cristiano Ronaldo", isCorrect: false },
            { text: "Josef Bican", isCorrect: true },
            { text: "Pele", isCorrect: false },
          ],
        },
      ],
      MMA: [
        {
          question: "UFC qachon tashkil etilgan?",
          options: [
            { text: "1990", isCorrect: false },
            { text: "1993", isCorrect: true },
            { text: "1995", isCorrect: false },
            { text: "1998", isCorrect: false },
          ],
        },
        {
          question: "Qaysi jangchi 'The Notorious' laqabi bilan tanilgan?",
          options: [
            { text: "Jon Jones", isCorrect: false },
            { text: "Conor McGregor", isCorrect: true },
            { text: "Khabib Nurmagomedov", isCorrect: false },
            { text: "Anderson Silva", isCorrect: false },
          ],
        },
        {
          question: "MMA jangida nechta raund bo'ladi?",
          options: [
            { text: "3 raund", isCorrect: false },
            { text: "5 raund (title fight)", isCorrect: false },
            { text: "3 yoki 5 raund", isCorrect: true },
            { text: "7 raund", isCorrect: false },
          ],
        },
        {
          question: "Qaysi jangchi eng ko'p UFC chempionlik unvoniga ega?",
          options: [
            { text: "Jon Jones", isCorrect: false },
            { text: "Anderson Silva", isCorrect: false },
            { text: "Demetrious Johnson", isCorrect: true },
            { text: "Georges St-Pierre", isCorrect: false },
          ],
        },
        {
          question: "UFC'da qaysi vazn toifasi eng og'ir?",
          options: [
            { text: "Light Heavyweight", isCorrect: false },
            { text: "Heavyweight", isCorrect: true },
            { text: "Middleweight", isCorrect: false },
            { text: "Welterweight", isCorrect: false },
          ],
        },
      ],
      Music: [
        {
          question: "The Beatles guruhi qaysi shahardan?",
          options: [
            { text: "London", isCorrect: false },
            { text: "Liverpool", isCorrect: true },
            { text: "Manchester", isCorrect: false },
            { text: "Birmingham", isCorrect: false },
          ],
        },
        {
          question: "Michael Jackson qaysi albom eng ko'p sotilgan?",
          options: [
            { text: "Bad", isCorrect: false },
            { text: "Thriller", isCorrect: true },
            { text: "Off the Wall", isCorrect: false },
            { text: "Dangerous", isCorrect: false },
          ],
        },
        {
          question: "Piano'da nechta tugma bo'ladi?",
          options: [
            { text: "86", isCorrect: false },
            { text: "88", isCorrect: true },
            { text: "90", isCorrect: false },
            { text: "84", isCorrect: false },
          ],
        },
        {
          question: "Qaysi musiqachi 'King of Pop' laqabi bilan tanilgan?",
          options: [
            { text: "Elvis Presley", isCorrect: false },
            { text: "Michael Jackson", isCorrect: true },
            { text: "Prince", isCorrect: false },
            { text: "Madonna", isCorrect: false },
          ],
        },
        {
          question: "Guitarda nechta tor bo'ladi?",
          options: [
            { text: "4", isCorrect: false },
            { text: "6", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "12", isCorrect: false },
          ],
        },
      ],
    };

    // Create or update categories
    const createdCategories = {};
    for (const catData of categoriesData) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create(catData);
        console.log(
          `✅ Created category: ${category.name} (order: ${catData.order})`
        );
      } else {
        // Update order if it's missing or different
        if (category.order !== catData.order) {
          category.order = catData.order;
          await category.save();
          console.log(
            `🔄 Updated category: ${category.name} (order: ${catData.order})`
          );
        } else {
          console.log(
            `ℹ️  Category already exists: ${category.name} (order: ${catData.order})`
          );
        }
      }
      createdCategories[category.name] = category;
    }

    // Create questions
    for (const category of Object.values(createdCategories)) {
      const categoryQuestions = questionsData[category.name] || [];
      for (const questionData of categoryQuestions) {
        const existingQuestion = await Question.findOne({
          categoryId: category._id,
          question: questionData.question,
        });
        if (!existingQuestion) {
          await Question.create({
            categoryId: category._id,
            question: questionData.question,
            options: questionData.options,
          });
          console.log(
            `✅ Created question in ${
              category.name
            }: ${questionData.question.substring(0, 50)}...`
          );
        }
      }
    }

    console.log("✅ Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
}
