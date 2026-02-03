/**
 * To'g'ri javobni har xil o'rinda qilish (games va football).
 * Football rasmlik savollarda savol matnini "O'yinchini aniqlang" / "Who is this player?" ga o'zgartirish.
 */
const fs = require("fs");
const path = require("path");

const GAMES_PATH = path.join(__dirname, "../questions/games.json");
const FOOTBALL_PATH = path.join(__dirname, "../questions/football.json");

const IMAGE_QUESTION = {
  uz: "O'yinchini aniqlang",
  ru: "Угадайте футболиста",
  en: "Who is this player?",
};

function reorderOptions(options, correctPosition) {
  const correct = options.find((o) => o.isCorrect === true);
  const wrong = options.filter((o) => o.isCorrect !== true);
  const result = [...wrong];
  result.splice(correctPosition, 0, correct);
  return result;
}

function processFile(filePath, isFootball = false) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const options = item.options;
    if (!Array.isArray(options) || options.length !== 4) continue;

    // To'g'ri javob o'rni: 1, 2 yoki 3 (1-chi o'rinda doim bo'lmasin — har xil)
    const correctPosition = (i % 3) + 1;
    item.options = reorderOptions(options, correctPosition);

    if (isFootball && item.images && item.images.length > 0) {
      item.question = { ...IMAGE_QUESTION };
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ " + path.basename(filePath) + " yangilandi.");
}

processFile(GAMES_PATH, false);
processFile(FOOTBALL_PATH, true);
console.log("Tugadi.");
