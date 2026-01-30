const mongoose = require("mongoose");
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
    seedData();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Seed Data
async function seedData() {
  try {
    console.log("🔄 Seeding data...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Category.deleteMany({});
    // await Question.deleteMany({});

    // Categories (with order: 1=Movies, 2=Logical, 3=Geographical, 4=Football, 5=MMA, 6=Music)
    // Multi-language support: uz, ru, en
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
          uz: "Mantiq",
          ru: "Логика",
          en: "Logical",
        },
        order: 2,
      },
      {
        name: {
          uz: "Geografiya",
          ru: "География",
          en: "Geographical",
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

    // Create or update categories
    const categories = [];
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
        } else {
          console.log(
            `ℹ️  Category already exists: ${category.name.uz} / ${category.name.ru} / ${category.name.en} (order: ${catData.order})`
          );
        }
      }
      categories.push(category);
    }

    // Questions for each category
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
      Logical: [],
      Geographical: [],
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

    // Create questions for each category
    // Map category names (old format) to new format
    const categoryNameMap = {
      "Movies": "Movies",
      "Logical": "Logical",
      "Geographical": "Geographical",
      "Football": "Football",
      "MMA": "MMA",
      "Music": "Music",
    };

    for (const category of categories) {
      // Find questions by category name in English (for backward compatibility)
      const categoryNameEn = category.name.en || category.name;
      const categoryQuestions = questionsData[categoryNameMap[categoryNameEn] || categoryNameEn] || [];

      for (const questionData of categoryQuestions) {
        // Check if question already exists
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
        } else {
          console.log(`ℹ️  Question already exists in ${category.name}`);
        }
      }
    }

    console.log("✅ Data seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}
