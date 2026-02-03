/**
 * Geografiya: "Dunyodagi eng..." va "Eng..." savollarida har bir variantni
 * bitta javobga o'zgartirish, noto'g'ri variantlarni qiyin (yaqin) qilish.
 */
const fs = require("fs");
const path = require("path");

const GEO_PATH = path.join(__dirname, "../questions/geographical.json");
const data = JSON.parse(fs.readFileSync(GEO_PATH, "utf8"));

// Qisqa savol matni -> { correct: {uz,ru,en}, wrong: [3 ta {uz,ru,en}] }
// Barcha "eng" va ko'p javobli savollar uchun bitta javob + 3 ta yaqin (qiyin) variant
const singleOptionMap = {
  "Eng ko'p qush turlariga ega": { correct: { uz: "Braziliya", ru: "Бразилия", en: "Brazil" }, wrong: [{ uz: "Kolumbiya", ru: "Колумбия", en: "Colombia" }, { uz: "Peru", ru: "Перу", en: "Peru" }, { uz: "Indoneziya", ru: "Индонезия", en: "Indonesia" }] },
  "Inson uchun eng xavfsiz": { correct: { uz: "Panda", ru: "Панда", en: "Panda" }, wrong: [{ uz: "Kiyik", ru: "Олень", en: "Deer" }, { uz: "Quyon", ru: "Кролик", en: "Rabbit" }, { uz: "Zebra", ru: "Зебра", en: "Zebra" }] },
  "Dunyodagi eng baland tog'": { correct: { uz: "Everest", ru: "Эверест", en: "Everest" }, wrong: [{ uz: "K2", ru: "К2", en: "K2" }, { uz: "Kangchenjunga", ru: "Канченджанга", en: "Kangchenjunga" }, { uz: "Lhotse", ru: "Лхоцзе", en: "Lhotse" }] },
  "Qaysi hayvonlar o'z bolalariga": { correct: { uz: "Fil", ru: "Слон", en: "Elephant" }, wrong: [{ uz: "Delfin", ru: "Дельфин", en: "Dolphin" }, { uz: "Bo'ri", ru: "Волк", en: "Wolf" }, { uz: "Ayiq", ru: "Медведь", en: "Bear" }] },
  "Eng tez quruqlik hayvonlari": { correct: { uz: "Gepard", ru: "Гепард", en: "Cheetah" }, wrong: [{ uz: "Yaguar", ru: "Ягуар", en: "Jaguar" }, { uz: "Tuyaqush", ru: "Страус", en: "Ostrich" }, { uz: "Ot", ru: "Лошадь", en: "Horse" }] },
  "Dunyodagi eng kichik davlatlar": { correct: { uz: "Vatikan", ru: "Ватикан", en: "Vatican City" }, wrong: [{ uz: "Monako", ru: "Монако", en: "Monaco" }, { uz: "Nauru", ru: "Науру", en: "Nauru" }, { uz: "San-Marino", ru: "Сан-Марино", en: "San Marino" }] },
  "Eng aqlli hayvonlar": { correct: { uz: "Delfin", ru: "Дельфин", en: "Dolphin" }, wrong: [{ uz: "Shimpanze", ru: "Шимпанзе", en: "Chimpanzee" }, { uz: "Fil", ru: "Слон", en: "Elephant" }, { uz: "Qarg'a", ru: "Ворона", en: "Crow" }] },
  "Eng uzoq umr ko'ruvchi": { correct: { uz: "Toshbaqa", ru: "Черепаха", en: "Tortoise" }, wrong: [{ uz: "Kit", ru: "Кит", en: "Whale" }, { uz: "Akula", ru: "Акула", en: "Shark" }, { uz: "Fil", ru: "Слон", en: "Elephant" }] },
  "Dunyodagi eng katta okeanlar": { correct: { uz: "Tinch okeani", ru: "Тихий океан", en: "Pacific Ocean" }, wrong: [{ uz: "Atlantika okeani", ru: "Атлантический океан", en: "Atlantic Ocean" }, { uz: "Hind okeani", ru: "Индийский океан", en: "Indian Ocean" }, { uz: "Shimoliy Muz okeani", ru: "Северный Ледовитый", en: "Arctic Ocean" }] },
  "Qaysi hayvonlar faqat o'simlik": { correct: { uz: "Fil", ru: "Слон", en: "Elephant" }, wrong: [{ uz: "Sigir", ru: "Корова", en: "Cow" }, { uz: "Kiyik", ru: "Олень", en: "Deer" }, { uz: "Zebra", ru: "Зебра", en: "Zebra" }] },
  "Eng katta qushlar": { correct: { uz: "Tuyaqush", ru: "Страус", en: "Ostrich" }, wrong: [{ uz: "Emu", ru: "Эму", en: "Emu" }, { uz: "Kazuar", ru: "Казуар", en: "Cassowary" }, { uz: "Kondor", ru: "Кондор", en: "Condor" }] },
  "Dunyodagi eng uzun daryolar": { correct: { uz: "Nil", ru: "Нил", en: "Nile" }, wrong: [{ uz: "Amazonka", ru: "Амазонка", en: "Amazon" }, { uz: "Yanszi", ru: "Янцзы", en: "Yangtze" }, { uz: "Missisipi", ru: "Миссисипи", en: "Mississippi" }] },
  "Qaysi hayvonlar suvda yashab": { correct: { uz: "Kit", ru: "Кит", en: "Whale" }, wrong: [{ uz: "Delfin", ru: "Дельфин", en: "Dolphin" }, { uz: "Tyulen", ru: "Тюлень", en: "Seal" }, { uz: "Timsoh", ru: "Крокодил", en: "Crocodile" }] },
  "Eng zaharli jonzotlar": { correct: { uz: "Kobra", ru: "Кобра", en: "Cobra" }, wrong: [{ uz: "Chayon", ru: "Скорпион", en: "Scorpion" }, { uz: "Qora beva o'rgimchak", ru: "Чёрная вдова", en: "Black widow spider" }, { uz: "Ari", ru: "Пчела", en: "Bee" }] },
  "Dunyodagi eng katta hayvonlar": { correct: { uz: "Ko'k kit", ru: "Синий кит", en: "Blue whale" }, wrong: [{ uz: "Fil", ru: "Слон", en: "Elephant" }, { uz: "Akula", ru: "Акула", en: "Shark" }, { uz: "Begemot", ru: "Бегемот", en: "Hippo" }] },
  "Qaysi hayvonlar tunda faol": { correct: { uz: "Boyo'g'li", ru: "Сова", en: "Owl" }, wrong: [{ uz: "Yarasa", ru: "Летучая мышь", en: "Bat" }, { uz: "Tulki", ru: "Лиса", en: "Fox" }, { uz: "Yo'lbars", ru: "Тигр", en: "Tiger" }] },
  "Eng baland uchadigan qushlar": { correct: { uz: "Burgut", ru: "Орёл", en: "Eagle" }, wrong: [{ uz: "Lochin", ru: "Сокол", en: "Falcon" }, { uz: "Turna", ru: "Журавль", en: "Crane" }, { uz: "Qarchi", ru: "Ястреб", en: "Hawk" }] },
  "Dunyodagi eng sovuq joylar": { correct: { uz: "Antarktida", ru: "Антарктида", en: "Antarctica" }, wrong: [{ uz: "Sibir", ru: "Сибирь", en: "Siberia" }, { uz: "Grenlandiya", ru: "Гренландия", en: "Greenland" }, { uz: "Alaska", ru: "Аляска", en: "Alaska" }] },
  "Qaysi hayvonlar guruh bo'lib": { correct: { uz: "Bo'ri", ru: "Волк", en: "Wolf" }, wrong: [{ uz: "Sher", ru: "Лев", en: "Lion" }, { uz: "Delfin", ru: "Дельфин", en: "Dolphin" }, { uz: "Fil", ru: "Слон", en: "Elephant" }] },
  "Dunyodagi eng katta cho'llar": { correct: { uz: "Sahara", ru: "Сахара", en: "Sahara" }, wrong: [{ uz: "Antarktida", ru: "Антарктида", en: "Antarctica" }, { uz: "Arab cho'li", ru: "Аравийская пустыня", en: "Arabian Desert" }, { uz: "Gobi", ru: "Гоби", en: "Gobi" }] },
  "Qaysi hayvonlar yerdagi eng katta": { correct: { uz: "Fil", ru: "Слон", en: "Elephant" }, wrong: [{ uz: "Karkidon", ru: "Носорог", en: "Rhinoceros" }, { uz: "Begemot", ru: "Бегемот", en: "Hippo" }, { uz: "Jirafa", ru: "Жираф", en: "Giraffe" }] },
  "Dunyodagi eng chuqur okean": { correct: { uz: "Mariyana xandaqi", ru: "Марианская впадина", en: "Mariana Trench" }, wrong: [{ uz: "Tinch okeani", ru: "Тихий океан", en: "Pacific" }, { uz: "Atlantika", ru: "Атлантика", en: "Atlantic" }, { uz: "Puerto-Riko xandaqi", ru: "Жёлоб Пуэрто-Рико", en: "Puerto Rico Trench" }] },
  "Qaysi qushlar ucha olmaydi": { correct: { uz: "Tuyaqush", ru: "Страус", en: "Ostrich" }, wrong: [{ uz: "Pingvin", ru: "Пингвин", en: "Penguin" }, { uz: "Emu", ru: "Эму", en: "Emu" }, { uz: "Kazuar", ru: "Казуар", en: "Cassowary" }] },
  "Eng katta qit'a": { correct: { uz: "Osiyo", ru: "Азия", en: "Asia" }, wrong: [{ uz: "Afrika", ru: "Африка", en: "Africa" }, { uz: "Shimoliy Amerika", ru: "Северная Америка", en: "North America" }, { uz: "Janubiy Amerika", ru: "Южная Америка", en: "South America" }] },
  "Dunyodagi eng katta orol": { correct: { uz: "Grenlandiya", ru: "Гренландия", en: "Greenland" }, wrong: [{ uz: "Madagaskar", ru: "Мадагаскар", en: "Madagascar" }, { uz: "Borneo", ru: "Борнео", en: "Borneo" }, { uz: "Yangi Gvineya", ru: "Новая Гвинея", en: "New Guinea" }] },
  "Qaysi hayvonlar uyquda qishlaydi": { correct: { uz: "Ayiq", ru: "Медведь", en: "Bear" }, wrong: [{ uz: "Sichqon", ru: "Мышь", en: "Mouse" }, { uz: "Echki", ru: "Ёж", en: "Hedgehog" }, { uz: "Yo'lbars", ru: "Тигр", en: "Tiger" }] },
  "Eng katta dengiz (yopiq suv)": { correct: { uz: "Kaspiy dengizi", ru: "Каспийское море", en: "Caspian Sea" }, wrong: [{ uz: "O'rta yer dengizi", ru: "Средиземное", en: "Mediterranean" }, { uz: "Qora dengiz", ru: "Чёрное море", en: "Black Sea" }, { uz: "Baykal", ru: "Байкал", en: "Baikal" }] },
  "Qaysi hasharotlar asal yig'adi": { correct: { uz: "Ari", ru: "Пчела", en: "Bee" }, wrong: [{ uz: "Chivin", ru: "Муха", en: "Fly" }, { uz: "Chayon", ru: "Скорпион", en: "Scorpion" }, { uz: "O'rgimchak", ru: "Паук", en: "Spider" }] },
  "Dunyodagi eng baland vodiy": { correct: { uz: "Tibet platosi", ru: "Тибетское плато", en: "Tibetan Plateau" }, wrong: [{ uz: "Grand Kanyon", ru: "Гранд-Каньон", en: "Grand Canyon" }, { uz: "Rift vodiysi", ru: "Рифтовая долина", en: "Rift Valley" }, { uz: "Altiplano", ru: "Альтиплано", en: "Altiplano" }] },
  "Dunyodagi eng katta tropik": { correct: { uz: "Amazonka", ru: "Амазонка", en: "Amazon" }, wrong: [{ uz: "Kongo", ru: "Конго", en: "Congo" }, { uz: "Indoneziya", ru: "Индонезия", en: "Indonesia" }, { uz: "Borneo", ru: "Борнео", en: "Borneo" }] },
  "Dunyodagi eng uzun tog' tizmasi": { correct: { uz: "Andlar", ru: "Анды", en: "Andes" }, wrong: [{ uz: "Himalay", ru: "Гималаи", en: "Himalayas" }, { uz: "Alp", ru: "Альпы", en: "Alps" }, { uz: "Ural", ru: "Урал", en: "Ural" }] },
  "Dunyodagi eng katta ko'l (chirindisi)": { correct: { uz: "Baykal", ru: "Байкал", en: "Baikal" }, wrong: [{ uz: "Viktoriya", ru: "Виктория", en: "Victoria" }, { uz: "Superior", ru: "Верхнее", en: "Superior" }, { uz: "Tanganyika", ru: "Танганьика", en: "Tanganyika" }] },
  "Dunyodagi eng katta vulkan": { correct: { uz: "Mauna Loa", ru: "Мауна-Лоа", en: "Mauna Loa" }, wrong: [{ uz: "Vezuviy", ru: "Везувий", en: "Vesuvius" }, { uz: "Fuji", ru: "Фудзи", en: "Fuji" }, { uz: "Kotopaksi", ru: "Котопахи", en: "Cotopaxi" }] },
  "Dunyodagi eng katta muzlik": { correct: { uz: "Antarktida", ru: "Антарктида", en: "Antarctica" }, wrong: [{ uz: "Grenlandiya", ru: "Гренландия", en: "Greenland" }, { uz: "Alaska", ru: "Аляска", en: "Alaska" }, { uz: "Himalay", ru: "Гималаи", en: "Himalayas" }] },
  "Qaysi okean eng chuqur": { correct: { uz: "Tinch okeani", ru: "Тихий океан", en: "Pacific Ocean" }, wrong: [{ uz: "Atlantika", ru: "Атлантика", en: "Atlantic" }, { uz: "Hind okeani", ru: "Индийский", en: "Indian" }, { uz: "Shimoliy Muz", ru: "Северный Ледовитый", en: "Arctic" }] },
  "Dunyodagi eng katta daryo (hajmi)": { correct: { uz: "Amazonka", ru: "Амазонка", en: "Amazon" }, wrong: [{ uz: "Nil", ru: "Нил", en: "Nile" }, { uz: "Yanszi", ru: "Янцзы", en: "Yangtze" }, { uz: "Missisipi", ru: "Миссисипи", en: "Mississippi" }] },
  "Dunyodagi eng katta o'rmon": { correct: { uz: "Sibir (taiga)", ru: "Сибирь (тайга)", en: "Siberia (taiga)" }, wrong: [{ uz: "Amazonka", ru: "Амазонка", en: "Amazon" }, { uz: "Kongo", ru: "Конго", en: "Congo" }, { uz: "Kanada", ru: "Канада", en: "Canada" }] },
  "Dunyodagi eng qurg'oqchil": { correct: { uz: "Atakama", ru: "Атакама", en: "Atacama" }, wrong: [{ uz: "Sahara", ru: "Сахара", en: "Sahara" }, { uz: "Lut (Eron)", ru: "Лут (Иран)", en: "Lut (Iran)" }, { uz: "Arab cho'li", ru: "Аравийская пустыня", en: "Arabian Desert" }] },
  "Eng katta dengiz sutemizuvchisi": { correct: { uz: "Ko'k kit", ru: "Синий кит", en: "Blue whale" }, wrong: [{ uz: "Fil", ru: "Слон", en: "Elephant" }, { uz: "Akula", ru: "Акула", en: "Shark" }, { uz: "Tyulen", ru: "Тюлень", en: "Seal" }] },
  "Dunyodagi eng baland shahar": { correct: { uz: "La-Ras", ru: "Ла-Пас", en: "La Paz" }, wrong: [{ uz: "Lhasa", ru: "Лхаса", en: "Lhasa" }, { uz: "Kito", ru: "Кито", en: "Quito" }, { uz: "Bogota", ru: "Богота", en: "Bogota" }] },
  "Dunyodagi eng uzun qirg'oq": { correct: { uz: "Kanada", ru: "Канада", en: "Canada" }, wrong: [{ uz: "Indoneziya", ru: "Индонезия", en: "Indonesia" }, { uz: "Rossiya", ru: "Россия", en: "Russia" }, { uz: "Avstraliya", ru: "Австралия", en: "Australia" }] },
  "Eng katta yopiq havza": { correct: { uz: "Kaspiy havzasi", ru: "Каспийский бассейн", en: "Caspian basin" }, wrong: [{ uz: "Aral", ru: "Арал", en: "Aral" }, { uz: "Chad", ru: "Чад", en: "Chad" }, { uz: "Titikaka", ru: "Титикака", en: "Titicaca" }] },
  "Dunyodagi eng issiq mintaqa": { correct: { uz: "Dallol (Efiopiya)", ru: "Даллол (Эфиопия)", en: "Dallol (Ethiopia)" }, wrong: [{ uz: "Sahara", ru: "Сахара", en: "Sahara" }, { uz: "Lut (Eron)", ru: "Лут (Иран)", en: "Lut (Iran)" }, { uz: "Gobi", ru: "Гоби", en: "Gobi" }] },
  "Dunyodagi eng katta ko'l (umuman)": { correct: { uz: "Kaspiy dengizi", ru: "Каспийское море", en: "Caspian Sea" }, wrong: [{ uz: "Superior", ru: "Верхнее", en: "Superior" }, { uz: "Viktoriya", ru: "Виктория", en: "Victoria" }, { uz: "Baykal", ru: "Байкал", en: "Baikal" }] },
  "Eng katta dengiz bo'g'ozi": { correct: { uz: "Dreyk bo'g'ozi", ru: "Пролив Дрейка", en: "Drake Passage" }, wrong: [{ uz: "Gibraltar", ru: "Гибралтар", en: "Gibraltar" }, { uz: "Bospor", ru: "Босфор", en: "Bosporus" }, { uz: "Malakka", ru: "Малакка", en: "Malacca" }] },
  "Dunyodagi eng baland suv havzasi": { correct: { uz: "Titikaka", ru: "Титикака", en: "Titicaca" }, wrong: [{ uz: "Baykal", ru: "Байкал", en: "Baikal" }, { uz: "Viktoriya", ru: "Виктория", en: "Victoria" }, { uz: "Superior", ru: "Верхнее", en: "Superior" }] },
  "Dunyodagi eng katta muzlik tizimi": { correct: { uz: "Antarktida", ru: "Антарктида", en: "Antarctica" }, wrong: [{ uz: "Grenlandiya", ru: "Гренландия", en: "Greenland" }, { uz: "Arktika", ru: "Арктика", en: "Arctic" }, { uz: "Himalay", ru: "Гималаи", en: "Himalayas" }] },
  "Dunyodagi eng katta delta": { correct: { uz: "Ganges-Brahmaputra", ru: "Ганг-Брахмапутра", en: "Ganges-Brahmaputra" }, wrong: [{ uz: "Nil", ru: "Нил", en: "Nile" }, { uz: "Amazonka", ru: "Амазонка", en: "Amazon" }, { uz: "Missisipi", ru: "Миссисипи", en: "Mississippi" }] },
  "Dunyodagi eng katta gidroelektrostansiya": { correct: { uz: "Sanxia (Xitoy)", ru: "Санься (Китай)", en: "Three Gorges (China)" }, wrong: [{ uz: "Itaipu", ru: "Итайпу", en: "Itaipu" }, { uz: "Guri", ru: "Гури", en: "Guri" }, { uz: "Grand Kulye", ru: "Гранд-Кули", en: "Grand Coulee" }] },
};

function findMapping(qUz) {
  for (const key of Object.keys(singleOptionMap)) {
    if (qUz.includes(key) || qUz.startsWith(key)) return singleOptionMap[key];
  }
  return null;
}

function needsUpdate(q) {
  const uz = q.question.uz || "";
  const isEng = /^(Dunyodagi )?[Ee]ng\s/.test(uz) || uz.includes("Dunyodagi eng") || uz.includes("eng katta") || uz.includes("eng baland") || uz.includes("eng uzun") || uz.includes("eng kichik") || uz.includes("eng chuqur") || uz.includes("eng sovuq") || uz.includes("eng issiq") || uz.includes("eng qurg'oqchil");
  const hasComma = q.options.some((o) => (o.text.uz || "").includes(","));
  return isEng || hasComma;
}

function firstItem(t) {
  if (!t || typeof t !== "object") return t;
  const uz = (t.uz || "").split(",")[0].trim();
  const ru = (t.ru || "").split(",")[0].trim();
  const en = (t.en || "").split(",")[0].trim();
  return { uz: uz || t.uz, ru: ru || t.ru, en: en || t.en };
}

let updated = 0;
for (let i = 0; i < data.length; i++) {
  const q = data[i];
  if (!needsUpdate(q)) continue;
  const mapping = findMapping(q.question.uz);
  if (mapping) {
    const { correct, wrong } = mapping;
    const newOptions = [
      { text: correct, isCorrect: true },
      ...wrong.map((w) => ({ text: w, isCorrect: false })),
    ];
    const pos = (i % 3) + 1;
    const correctOpt = newOptions.shift();
    newOptions.splice(pos, 0, correctOpt);
    data[i].options = newOptions;
    updated++;
  } else {
    // Fallback: har bir variantdan birinchi javob (verguldan oldin)
    const hasComma = q.options.some((o) => (o.text.uz || "").includes(","));
    if (hasComma) {
      const seen = new Set();
      const newOpts = [];
      for (const o of q.options) {
        const single = firstItem(o.text);
        const key = single.uz;
        if (seen.has(key)) continue;
        seen.add(key);
        newOpts.push({ text: single, isCorrect: o.isCorrect });
      }
      if (newOpts.length === 4) {
        const pos = (i % 3) + 1;
        const correctIdx = newOpts.findIndex((o) => o.isCorrect);
        const correctOpt = newOpts.splice(correctIdx, 1)[0];
        newOpts.splice(pos, 0, correctOpt);
        data[i].options = newOpts;
        updated++;
      }
    }
  }
}

fs.writeFileSync(GEO_PATH, JSON.stringify(data, null, 2), "utf8");
console.log("Yangilandi:", updated, "ta savol (bitta javob + qiyin variantlar)");
