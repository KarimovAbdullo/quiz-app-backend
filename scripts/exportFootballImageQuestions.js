const fs = require("fs");
const path = require("path");

const footballPath = path.join(__dirname, "../questions/football.json");
const outPath = path.join(__dirname, "../questions/football-rasmlik-savollar.md");

const data = JSON.parse(fs.readFileSync(footballPath, "utf8"));
const imageQuestions = data
  .filter((q) => q.images && q.images.length > 0)
  .map((q, i) => {
    const correct = q.options.find((o) => o.isCorrect);
    return {
      number: i + 1,
      question: q.question,
      correctAnswer: correct ? correct.text : null,
      images: q.images,
    };
  });

const jsonBlock = JSON.stringify(imageQuestions, null, 2);
const md = `# Futbol — rasmlik savollar va to'g'ri javoblar (JSON)

Rasmlarda klub emblemasi ko'rsatiladi. Savol: **O'yinchini aniqlang** / Who is this player?

\`\`\`json
${jsonBlock}
\`\`\`
`;

fs.writeFileSync(outPath, md, "utf8");
console.log("Yozildi:", imageQuestions.length, "ta savol ->", outPath);
