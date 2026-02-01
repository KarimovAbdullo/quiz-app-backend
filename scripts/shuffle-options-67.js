/**
 * Shuffle options for questions 34-100 (indices 33-99) so correct answer is at random position.
 * Does NOT touch image/images URLs.
 */
const fs = require("fs");
const path = require("path");

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const filePath = path.join(__dirname, "../questions/movies-new.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Only questions 34-100 (indices 33 to 99) — the 67 we added
const startIdx = 33;
const endIdx = 99;

for (let i = startIdx; i <= endIdx; i++) {
  if (data[i] && Array.isArray(data[i].options) && data[i].options.length > 0) {
    data[i].options = shuffleArray(data[i].options);
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
console.log(`Shuffled options for questions ${startIdx + 1}-${endIdx + 1} (67 questions). Image URLs unchanged.`);
