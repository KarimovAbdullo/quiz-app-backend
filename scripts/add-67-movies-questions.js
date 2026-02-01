/**
 * Adds 67 new movie questions to movies-new.json (total becomes 100).
 * Image questions use placeholder URLs; existing 33 questions are unchanged.
 */
const fs = require("fs");
const path = require("path");

const PLACEHOLDER_FRAME = "https://placeholder.example/movies/frame-REPLACE.jpg";
const PLACEHOLDER_ACTORS = [
  "https://placeholder.example/movies/actors-REPLACE-1.jpg",
  "https://placeholder.example/movies/actors-REPLACE-2.jpg",
  "https://placeholder.example/movies/actors-REPLACE-3.jpg",
];

function opt(uz, ru, en, isCorrect) {
  return { text: { uz, ru, en }, isCorrect: !!isCorrect };
}

function q(questionUz, questionRu, questionEn, options, imageOrImages = null) {
  const item = {
    question: { uz: questionUz, ru: questionRu, en: questionEn },
    options: options.map((o) => opt(o.uz, o.ru, o.en, o.correct)),
  };
  if (Array.isArray(imageOrImages)) item.images = imageOrImages;
  else if (imageOrImages) item.image = imageOrImages;
  else item.image = null;
  return item;
}

const newQuestions = [
  // 34 — text
  q(
    "Qaysi film 'Eng yaxshi film' Oscarini birinchi marta qo'lga kiritgan (1929)?",
    "Какой фильм первым получил «Оскар» за лучший фильм (1929)?",
    "Which film was the first to win the Academy Award for Best Picture (1929)?",
    [
      { uz: "Wings", ru: "Крылья", en: "Wings", correct: true },
      { uz: "Sunrise", ru: "Восход", en: "Sunrise", correct: false },
      { uz: "The Jazz Singer", ru: "Певец джаза", en: "The Jazz Singer", correct: false },
      { uz: "The Broadway Melody", ru: "Бродвейская мелодия", en: "The Broadway Melody", correct: false },
    ]
  ),
  // 35 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Pulp Fiction", ru: "Криминальное чтиво", en: "Pulp Fiction", correct: true },
      { uz: "Reservoir Dogs", ru: "Бешеные псы", en: "Reservoir Dogs", correct: false },
      { uz: "Kill Bill", ru: "Убить Билла", en: "Kill Bill", correct: false },
      { uz: "Jackie Brown", ru: "Джеки Браун", en: "Jackie Brown", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 36 — text
  q(
    "'May the Force be with you' — bu replika qaysi filmdan?",
    "Из какого фильма фраза «Да пребудет с тобой Сила»?",
    "Which movie is the line 'May the Force be with you' from?",
    [
      { uz: "Star Wars", ru: "Звёздные войны", en: "Star Wars", correct: true },
      { uz: "Star Trek", ru: "Звёздный путь", en: "Star Trek", correct: false },
      { uz: "The Matrix", ru: "Матрица", en: "The Matrix", correct: false },
      { uz: "Dune", ru: "Дюна", en: "Dune", correct: false },
    ]
  ),
  // 37 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Forrest Gump", ru: "Форрест Гамп", en: "Forrest Gump", correct: true },
      { uz: "Saving Private Ryan", ru: "Спасти рядового Райана", en: "Saving Private Ryan", correct: false },
      { uz: "Cast Away", ru: "Изгой", en: "Cast Away", correct: false },
      { uz: "The Green Mile", ru: "Зелёная миля", en: "The Green Mile", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 38 — text
  q(
    "Inception filmida Dom Cobb qahramonini kim ijro etgan?",
    "Кто сыграл Доминика Кобба в фильме «Начало»?",
    "Who played Dom Cobb in Inception?",
    [
      { uz: "Christian Bale", ru: "Кристиан Бейл", en: "Christian Bale", correct: false },
      { uz: "Leonardo DiCaprio", ru: "Леонардо ДиКаприо", en: "Leonardo DiCaprio", correct: true },
      { uz: "Matt Damon", ru: "Мэтт Деймон", en: "Matt Damon", correct: false },
      { uz: "Brad Pitt", ru: "Брэд Питт", en: "Brad Pitt", correct: false },
    ]
  ),
  // 39 — text
  q(
    "The Silence of the Lambs qachon 'Eng yaxshi film' Oscarini oldi?",
    "Когда «Молчание ягнят» получило «Оскар» за лучший фильм?",
    "When did The Silence of the Lambs win the Best Picture Oscar?",
    [
      { uz: "1989", ru: "1989", en: "1989", correct: false },
      { uz: "1990", ru: "1990", en: "1990", correct: false },
      { uz: "1991", ru: "1991", en: "1991", correct: true },
      { uz: "1992", ru: "1992", en: "1992", correct: false },
    ]
  ),
  // 40 — frame placeholder
  q(
    "Bu kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "The Matrix", ru: "Матрица", en: "The Matrix", correct: true },
      { uz: "Inception", ru: "Начало", en: "Inception", correct: false },
      { uz: "Blade Runner", ru: "Бегущий по лезвию", en: "Blade Runner", correct: false },
      { uz: "Minority Report", ru: "Особое мнение", en: "Minority Report", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 41 — text
  q(
    "Alfred Hitchcock qaysi filmida 'Psycho' deb nomlangan?",
    "Как называется знаменитый фильм Хичкока с душем?",
    "What is the famous Hitchcock film with the shower scene?",
    [
      { uz: "Vertigo", ru: "Головокружение", en: "Vertigo", correct: false },
      { uz: "Psycho", ru: "Психо", en: "Psycho", correct: true },
      { uz: "Rear Window", ru: "Окно во двор", en: "Rear Window", correct: false },
      { uz: "North by Northwest", ru: "К северу через северо-запад", en: "North by Northwest", correct: false },
    ]
  ),
  // 42 — text
  q(
    "Franchise qaysi filmdan boshlandi: Harry Potter yoki Lord of the Rings?",
    "Какой франшиза стартовала раньше: Гарри Поттер или Властелин колец?",
    "Which franchise film was released first: Harry Potter or Lord of the Rings?",
    [
      { uz: "Harry Potter (2001)", ru: "Гарри Поттер (2001)", en: "Harry Potter (2001)", correct: true },
      { uz: "Lord of the Rings (2001)", ru: "Властелин колец (2001)", en: "Lord of the Rings (2001)", correct: false },
      { uz: "Ikkalasi bir yil", ru: "Оба в один год", en: "Both same year", correct: false },
      { uz: "Lord of the Rings (2002)", ru: "Властелин колец (2002)", en: "Lord of the Rings (2002)", correct: false },
    ]
  ),
  // 43 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Ocean's Eleven", ru: "Одиннадцать друзей Оушена", en: "Ocean's Eleven", correct: true },
      { uz: "The Italian Job", ru: "Итальянская работа", en: "The Italian Job", correct: false },
      { uz: "Snatch", ru: "Большой куш", en: "Snatch", correct: false },
      { uz: "Heat", ru: "Жар тела", en: "Heat", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 44 — text
  q(
    "Christopher Nolan qaysi filmida qahramon 'dream within a dream' tushida?",
    "В каком фильме Нолана герой во сне внутри сна?",
    "In which Nolan film does the hero have a dream within a dream?",
    [
      { uz: "The Prestige", ru: "Престиж", en: "The Prestige", correct: false },
      { uz: "Inception", ru: "Начало", en: "Inception", correct: true },
      { uz: "Interstellar", ru: "Интерстеллар", en: "Interstellar", correct: false },
      { uz: "Memento", ru: "Помни", en: "Memento", correct: false },
    ]
  ),
  // 45 — text
  q(
    "Qaysi film 'La La Land' ni bir vaqtning o'zida eng yaxshi film deb e'lon qildi, keyin o'zgartirdi?",
    "На какой церемонии «Оскара» сначала назвали не тот фильм лучшим?",
    "At which Oscars was the wrong Best Picture initially announced?",
    [
      { uz: "2017 — La La Land / Moonlight", ru: "2017 — Ла-Ла Ленд / Лунный свет", en: "2017 — La La Land / Moonlight", correct: true },
      { uz: "2018", ru: "2018", en: "2018", correct: false },
      { uz: "2016", ru: "2016", en: "2016", correct: false },
      { uz: "Hech qachon", ru: "Никогда", en: "Never", correct: false },
    ]
  ),
  // 46 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Fight Club", ru: "Бойцовский клуб", en: "Fight Club", correct: true },
      { uz: "Se7en", ru: "Семь", en: "Se7en", correct: false },
      { uz: "The Game", ru: "Игра", en: "The Game", correct: false },
      { uz: "Gone Girl", ru: "Исчезнувшая", en: "Gone Girl", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 47 — text
  q(
    "Meryl Streep necha marta Oscar mukofotiga nomzod bo'lgan?",
    "Сколько раз Мерил Стрип была номинирована на «Оскар»?",
    "How many times has Meryl Streep been nominated for an Oscar?",
    [
      { uz: "15 ta", ru: "15", en: "15", correct: false },
      { uz: "21 ta", ru: "21", en: "21", correct: true },
      { uz: "10 ta", ru: "10", en: "10", correct: false },
      { uz: "18 ta", ru: "18", en: "18", correct: false },
    ]
  ),
  // 48 — text
  q(
    "Blade Runner qaysi asar asosida suratga olingan?",
    "По какому произведению снят «Бегущий по лезвию»?",
    "What is Blade Runner based on?",
    [
      { uz: "Philip K. Dick — Do Androids Dream of Electric Sheep?", ru: "Филип К. Дик", en: "Philip K. Dick — Do Androids Dream of Electric Sheep?", correct: true },
      { uz: "Isaac Asimov", ru: "Айзек Азимов", en: "Isaac Asimov", correct: false },
      { uz: "Ray Bradbury", ru: "Рэй Брэдбери", en: "Ray Bradbury", correct: false },
      { uz: "Original ssenariy", ru: "Оригинальный сценарий", en: "Original screenplay", correct: false },
    ]
  ),
  // 49 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "The Departed", ru: "Отступники", en: "The Departed", correct: true },
      { uz: "Goodfellas", ru: "Славные парни", en: "Goodfellas", correct: false },
      { uz: "The Wolf of Wall Street", ru: "Волк с Уолл-стрит", en: "The Wolf of Wall Street", correct: false },
      { uz: "Shutter Island", ru: "Остров проклятых", en: "Shutter Island", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 50 — text
  q(
    "Black Panther qaysi yilda ekranlarga chiqdi?",
    "В каком году вышел «Чёрная пантера»?",
    "When was Black Panther released?",
    [
      { uz: "2017", ru: "2017", en: "2017", correct: false },
      { uz: "2018", ru: "2018", en: "2018", correct: true },
      { uz: "2019", ru: "2019", en: "2019", correct: false },
      { uz: "2020", ru: "2020", en: "2020", correct: false },
    ]
  ),
  // 51 — text
  q(
    "'Here's looking at you, kid' — qaysi filmdan?",
    "Из какого фильма фраза «Вот за тебя, малыш»?",
    "Which movie has the line 'Here's looking at you, kid'?",
    [
      { uz: "Casablanca", ru: "Касабланка", en: "Casablanca", correct: true },
      { uz: "The Maltese Falcon", ru: "Сокровища Сьерра-Мадре", en: "The Maltese Falcon", correct: false },
      { uz: "To Have and Have Not", ru: "Иметь и не иметь", en: "To Have and Have Not", correct: false },
      { uz: "Key Largo", ru: "Ки-Ларго", en: "Key Largo", correct: false },
    ]
  ),
  // 52 — frame placeholder
  q(
    "Bu kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Gladiator", ru: "Гладиатор", en: "Gladiator", correct: true },
      { uz: "Braveheart", ru: "Храброе сердце", en: "Braveheart", correct: false },
      { uz: "Troy", ru: "Троя", en: "Troy", correct: false },
      { uz: "300", ru: "300 спартанцев", en: "300", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 53 — text
  q(
    "Quentin Tarantino qaysi filmida Uma Thurman sariq libosda?",
    "В каком фильме Тарантино Ума Турман в жёлтом костюме?",
    "In which Tarantino film does Uma Thurman wear a yellow outfit?",
    [
      { uz: "Pulp Fiction", ru: "Криминальное чтиво", en: "Pulp Fiction", correct: true },
      { uz: "Kill Bill", ru: "Убить Билла", en: "Kill Bill", correct: false },
      { uz: "Jackie Brown", ru: "Джеки Браун", en: "Jackie Brown", correct: false },
      { uz: "Death Proof", ru: "Доказательство смерти", en: "Death Proof", correct: false },
    ]
  ),
  // 54 — text
  q(
    "E.T. qaysi rejissyor filmi?",
    "Кто режиссёр фильма «Инопланетянин»?",
    "Who directed E.T.?",
    [
      { uz: "Steven Spielberg", ru: "Стивен Спилберг", en: "Steven Spielberg", correct: true },
      { uz: "George Lucas", ru: "Джордж Лукас", en: "George Lucas", correct: false },
      { uz: "James Cameron", ru: "Джеймс Кэмерон", en: "James Cameron", correct: false },
      { uz: "Robert Zemeckis", ru: "Роберт Земекис", en: "Robert Zemeckis", correct: false },
    ]
  ),
  // 55 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Avengers: Endgame", ru: "Мстители: Финал", en: "Avengers: Endgame", correct: true },
      { uz: "Avengers: Infinity War", ru: "Мстители: Война бесконечности", en: "Avengers: Infinity War", correct: false },
      { uz: "Iron Man", ru: "Железный человек", en: "Iron Man", correct: false },
      { uz: "Captain America: Civil War", ru: "Первый мститель: Противостояние", en: "Captain America: Civil War", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 56 — text
  q(
    "The Shining asari qaysi yozuvchiga tegishli?",
    "Кто написал роман «Сияние»?",
    "Who wrote the novel The Shining?",
    [
      { uz: "Stephen King", ru: "Стивен Кинг", en: "Stephen King", correct: true },
      { uz: "Dean Koontz", ru: "Дин Кунц", en: "Dean Koontz", correct: false },
      { uz: "Clive Barker", ru: "Клайв Баркер", en: "Clive Barker", correct: false },
      { uz: "Peter Straub", ru: "Питер Страуб", en: "Peter Straub", correct: false },
    ]
  ),
  // 57 — text
  q(
    "Amélie qaysi poytaxtda suratga olingan?",
    "В каком городе снят фильм «Амели»?",
    "In which city is Amélie set?",
    [
      { uz: "London", ru: "Лондон", en: "London", correct: false },
      { uz: "Paris", ru: "Париж", en: "Paris", correct: true },
      { uz: "Lyon", ru: "Лион", en: "Lyon", correct: false },
      { uz: "Bordeaux", ru: "Бордо", en: "Bordeaux", correct: false },
    ]
  ),
  // 58 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Jurassic Park", ru: "Парк Юрского периода", en: "Jurassic Park", correct: true },
      { uz: "The Lost World", ru: "Затерянный мир", en: "The Lost World", correct: false },
      { uz: "King Kong", ru: "Кинг-Конг", en: "King Kong", correct: false },
      { uz: "Godzilla", ru: "Годзилла", en: "Godzilla", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 59 — text
  q(
    "Cate Blanchett qaysi filmda Katharine Hepburnni tasvirlagan?",
    "В каком фильме Кейт Бланшетт сыграла Кэтрин Хепбёрн?",
    "In which film did Cate Blanchett play Katharine Hepburn?",
    [
      { uz: "The Aviator", ru: "Авиатор", en: "The Aviator", correct: true },
      { uz: "Elizabeth", ru: "Елизавета", en: "Elizabeth", correct: false },
      { uz: "Blue Jasmine", ru: "Жасминовый рай", en: "Blue Jasmine", correct: false },
      { uz: "Carol", ru: "Кэрол", en: "Carol", correct: false },
    ]
  ),
  // 60 — text
  q(
    "No Country for Old Men qaysi yozuvchi asariga asoslangan?",
    "По какому произведению снят «Старикам тут не место»?",
    "What is No Country for Old Men based on?",
    [
      { uz: "Cormac McCarthy", ru: "Кормак Маккарти", en: "Cormac McCarthy novel", correct: true },
      { uz: "Stephen King", ru: "Стивен Кинг", en: "Stephen King", correct: false },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Elmore Leonard", ru: "Элмор Леонард", en: "Elmore Leonard", correct: false },
    ]
  ),
  // 61 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "The Social Network", ru: "Социальная сеть", en: "The Social Network", correct: true },
      { uz: "Moneyball", ru: "Человек, который изменил всё", en: "Moneyball", correct: false },
      { uz: "Steve Jobs", ru: "Стив Джобс", en: "Steve Jobs", correct: false },
      { uz: "The Trial of the Chicago 7", ru: "Суд над чикагской семёркой", en: "The Trial of the Chicago 7", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 62 — text
  q(
    "Pan's Labyrinth qaysi til filmi?",
    "На каком языке снят «Лабиринт фавна»?",
    "What language is Pan's Labyrinth in?",
    [
      { uz: "Ingliz", ru: "Английский", en: "English", correct: false },
      { uz: "Ispan", ru: "Испанский", en: "Spanish", correct: true },
      { uz: "Fransuz", ru: "Французский", en: "French", correct: false },
      { uz: "Italyan", ru: "Итальянский", en: "Italian", correct: false },
    ]
  ),
  // 63 — text
  q(
    "Heath Ledger qaysi filmda Jokerni o'ynagan?",
    "В каком фильме Хит Леджер сыграл Джокера?",
    "In which film did Heath Ledger play the Joker?",
    [
      { uz: "The Dark Knight", ru: "Тёмный рыцарь", en: "The Dark Knight", correct: true },
      { uz: "Batman Begins", ru: "Бэтмен: Начало", en: "Batman Begins", correct: false },
      { uz: "Brokeback Mountain", ru: "Горбатая гора", en: "Brokeback Mountain", correct: false },
      { uz: "Joker (2019)", ru: "Джокер (2019)", en: "Joker (2019)", correct: false },
    ]
  ),
  // 64 — frame placeholder
  q(
    "Bu kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Back to the Future", ru: "Назад в будущее", en: "Back to the Future", correct: true },
      { uz: "The Terminator", ru: "Терминатор", en: "The Terminator", correct: false },
      { uz: "Bill & Ted", ru: "Билл и Тед", en: "Bill & Ted", correct: false },
      { uz: "Groundhog Day", ru: "День сурка", en: "Groundhog Day", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 65 — text
  q(
    "Slumdog Millionaire qaysi mamlakatda suratga olingan?",
    "В какой стране снят «Миллионер из трущоб»?",
    "In which country is Slumdog Millionaire set?",
    [
      { uz: "Hindiston", ru: "Индия", en: "India", correct: true },
      { uz: "Pakistan", ru: "Пакистан", en: "Pakistan", correct: false },
      { uz: "Bangladesh", ru: "Бангладеш", en: "Bangladesh", correct: false },
      { uz: "Indoneziya", ru: "Индонезия", en: "Indonesia", correct: false },
    ]
  ),
  // 66 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "The Grand Budapest Hotel", ru: "Отель «Гранд Будапешт»", en: "The Grand Budapest Hotel", correct: true },
      { uz: "Moonrise Kingdom", ru: "Королевство полной луны", en: "Moonrise Kingdom", correct: false },
      { uz: "Fantastic Mr. Fox", ru: "Бесподобный мистер Фокс", en: "Fantastic Mr. Fox", correct: false },
      { uz: "Isle of Dogs", ru: "Остров собак", en: "Isle of Dogs", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 67 — text
  q(
    "Parasite qaysi mamlakat rejissyori filmi?",
    "Режиссёр какой страны снял «Паразиты»?",
    "Which country's director made Parasite?",
    [
      { uz: "Yaponiya", ru: "Япония", en: "Japan", correct: false },
      { uz: "Janubiy Koreya", ru: "Южная Корея", en: "South Korea", correct: true },
      { uz: "Xitoy", ru: "Китай", en: "China", correct: false },
      { uz: "Tayvan", ru: "Тайвань", en: "Taiwan", correct: false },
    ]
  ),
  // 68 — text
  q(
    "Mad Max: Fury Road qaysi yilda chiqdi?",
    "В каком году вышел «Безумный Макс: Дорога ярости»?",
    "When was Mad Max: Fury Road released?",
    [
      { uz: "2013", ru: "2013", en: "2013", correct: false },
      { uz: "2014", ru: "2014", en: "2014", correct: false },
      { uz: "2015", ru: "2015", en: "2015", correct: true },
      { uz: "2016", ru: "2016", en: "2016", correct: false },
    ]
  ),
  // 69 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Get Out", ru: "Прочь", en: "Get Out", correct: true },
      { uz: "Us", ru: "Мы", en: "Us", correct: false },
      { uz: "Nope", ru: "Нет", en: "Nope", correct: false },
      { uz: "Candyman", ru: "Кандимен", en: "Candyman", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 70 — text
  q(
    "Anthony Hopkins qancha vaqt ekranda Hannibal Lecter rolida (The Silence of the Lambs)?",
    "Сколько минут Энтони Хопкинс на экране в роли Ганнибала Лектера?",
    "How many minutes is Anthony Hopkins on screen as Hannibal Lecter in The Silence of the Lambs?",
    [
      { uz: "Taxminan 16 daqiqa", ru: "Около 16 минут", en: "About 16 minutes", correct: true },
      { uz: "1 soat", ru: "1 час", en: "1 hour", correct: false },
      { uz: "45 daqiqa", ru: "45 минут", en: "45 minutes", correct: false },
      { uz: "5 daqiqa", ru: "5 минут", en: "5 minutes", correct: false },
    ]
  ),
  // 71 — text
  q(
    "The Godfather qaysi roman asosida?",
    "По какому роману снят «Крёстный отец»?",
    "What novel is The Godfather based on?",
    [
      { uz: "Mario Puzo — The Godfather", ru: "Марио Пьюзо", en: "Mario Puzo — The Godfather", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Nicholas Pileggi", ru: "Николас Пиледжи", en: "Nicholas Pileggi", correct: false },
      { uz: "Stephen King", ru: "Стивен Кинг", en: "Stephen King", correct: false },
    ]
  ),
  // 72 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Once Upon a Time in Hollywood", ru: "Однажды в Голливуде", en: "Once Upon a Time in Hollywood", correct: true },
      { uz: "Django Unchained", ru: "Джанго освобождённый", en: "Django Unchained", correct: false },
      { uz: "Inglourious Basterds", ru: "Бесславные ублюдки", en: "Inglourious Basterds", correct: false },
      { uz: "The Hateful Eight", ru: "Восемь ненавистных", en: "The Hateful Eight", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 73 — text
  q(
    "Bong Joon-ho qaysi filmi 'Eng yaxshi film' Oscarini qo'lga kiritdi?",
    "Какой фильм Пон Чжун Хо получил «Оскар» за лучший фильм?",
    "Which Bong Joon-ho film won Best Picture?",
    [
      { uz: "Parasite", ru: "Паразиты", en: "Parasite", correct: true },
      { uz: "Snowpiercer", ru: "Сквозь снег", en: "Snowpiercer", correct: false },
      { uz: "Memories of Murder", ru: "Воспоминания об убийстве", en: "Memories of Murder", correct: false },
      { uz: "The Host", ru: "Хозяин", en: "The Host", correct: false },
    ]
  ),
  // 74 — text
  q(
    "'You talking to me?' — qaysi filmdan?",
    "Из какого фильма фраза «Ты ко мне обращаешься?»?",
    "Which movie has the line 'You talking to me?'?",
    [
      { uz: "Taxi Driver", ru: "Таксист", en: "Taxi Driver", correct: true },
      { uz: "Raging Bull", ru: "Бешеный бык", en: "Raging Bull", correct: false },
      { uz: "The King of Comedy", ru: "Король комедии", en: "The King of Comedy", correct: false },
      { uz: "Goodfellas", ru: "Славные парни", en: "Goodfellas", correct: false },
    ]
  ),
  // 75 — frame placeholder
  q(
    "Bu kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Spirited Away", ru: "Унесённые призраками", en: "Spirited Away", correct: true },
      { uz: "My Neighbor Totoro", ru: "Мой сосед Тоторо", en: "My Neighbor Totoro", correct: false },
      { uz: "Princess Mononoke", ru: "Принцесса Мононоке", en: "Princess Mononoke", correct: false },
      { uz: "Howl's Moving Castle", ru: "Ходячий замок", en: "Howl's Moving Castle", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 76 — text
  q(
    "Coco qaysi mamlakat madaniyatiga bag'ishlangan?",
    "Культуре какой страны посвящён «Тайна Коко»?",
    "What culture is Coco about?",
    [
      { uz: "Meksika", ru: "Мексика", en: "Mexico", correct: true },
      { uz: "Ispaniya", ru: "Испания", en: "Spain", correct: false },
      { uz: "Peru", ru: "Перу", en: "Peru", correct: false },
      { uz: "Kolumbiya", ru: "Колумбия", en: "Colombia", correct: false },
    ]
  ),
  // 77 — text
  q(
    "Joker (2019) qaysi personaj haqida?",
    "О каком персонаже комиксов фильм «Джокер» (2019)?",
    "Which comic character is Joker (2019) about?",
    [
      { uz: "Joker (DC/Batman)", ru: "Джокер (DC/Бэтмен)", en: "Joker (DC/Batman)", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Green Goblin", ru: "Зелёный гоблин", en: "Green Goblin", correct: false },
      { uz: "Lex Luthor", ru: "Лекс Лютор", en: "Lex Luthor", correct: false },
    ]
  ),
  // 78 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Knives Out", ru: "Достать ножи", en: "Knives Out", correct: true },
      { uz: "Glass Onion", ru: "Стеклянная луковица", en: "Glass Onion", correct: false },
      { uz: "Murder on the Orient Express", ru: "Убийство в Восточном экспрессе", en: "Murder on the Orient Express", correct: false },
      { uz: "Clue", ru: "Подозрение", en: "Clue", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 79 — text
  q(
    "1917 filmi qanday usulda suratga olingan (ko'rinishi)?",
    "Как снят фильм «1917» визуально?",
    "How was 1917 filmed to look like?",
    [
      { uz: "Bir kesimda (one-take)", ru: "Один дубль (one-take)", en: "As if one continuous take", correct: true },
      { uz: "Qora-oq", ru: "Чёрно-белый", en: "Black and white", correct: false },
      { uz: "3D", ru: "3D", en: "3D", correct: false },
      { uz: "IMAX", ru: "IMAX", en: "IMAX", correct: false },
    ]
  ),
  // 80 — text
  q(
    "Nomadland qaysi kitob asosida?",
    "По какой книге снят «Земля кочевников»?",
    "What is Nomadland based on?",
    [
      { uz: "Jessica Bruder — Nomadland", ru: "Джессика Брудер", en: "Jessica Bruder — Nomadland", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Jack Kerouac", ru: "Джек Керуак", en: "Jack Kerouac", correct: false },
      { uz: "John Steinbeck", ru: "Джон Стейнбек", en: "John Steinbeck", correct: false },
    ]
  ),
  // 81 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Dune (2021)", ru: "Дюна (2021)", en: "Dune (2021)", correct: true },
      { uz: "Blade Runner 2049", ru: "Бегущий по лезвию 2049", en: "Blade Runner 2049", correct: false },
      { uz: "Arrival", ru: "Прибытие", en: "Arrival", correct: false },
      { uz: "Interstellar", ru: "Интерстеллар", en: "Interstellar", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 82 — text
  q(
    "Everything Everywhere All at Once qaysi yilda Oscar oldi?",
    "В каком году «Всё везде и сразу» получило «Оскар»?",
    "When did Everything Everywhere All at Once win the Oscar?",
    [
      { uz: "2022", ru: "2022", en: "2022", correct: false },
      { uz: "2023", ru: "2023", en: "2023", correct: true },
      { uz: "2021", ru: "2021", en: "2021", correct: false },
      { uz: "2024", ru: "2024", en: "2024", correct: false },
    ]
  ),
  // 83 — text
  q(
    "Top Gun: Maverick qaysi filmin davomi?",
    "Продолжением какого фильма является «Топ Ган: Мэверик»?",
    "Which film is Top Gun: Maverick a sequel to?",
    [
      { uz: "Top Gun (1986)", ru: "Топ Ган (1986)", en: "Top Gun (1986)", correct: true },
      { uz: "Top Gun (1990)", ru: "Топ Ган (1990)", en: "Top Gun (1990)", correct: false },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Iron Eagle", ru: "Железный орёл", en: "Iron Eagle", correct: false },
    ]
  ),
  // 84 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Dune (2021)", ru: "Дюна (2021)", en: "Dune (2021)", correct: true },
      { uz: "Blade Runner 2049", ru: "Бегущий по лезвию 2049", en: "Blade Runner 2049", correct: false },
      { uz: "Arrival", ru: "Прибытие", en: "Arrival", correct: false },
      { uz: "Sicario", ru: "Убийца", en: "Sicario", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 85 — text
  q(
    "The Batman (2022) qaysi aktyor Batman rolida?",
    "Кто сыграл Бэтмена в «Бэтмен» (2022)?",
    "Who played Batman in The Batman (2022)?",
    [
      { uz: "Robert Pattinson", ru: "Роберт Паттинсон", en: "Robert Pattinson", correct: true },
      { uz: "Ben Affleck", ru: "Бен Аффлек", en: "Ben Affleck", correct: false },
      { uz: "Christian Bale", ru: "Кристиан Бейл", en: "Christian Bale", correct: false },
      { uz: "Michael Keaton", ru: "Майкл Китон", en: "Michael Keaton", correct: false },
    ]
  ),
  // 86 — text
  q(
    "RRR qaysi mamlakat filmi?",
    "Фильм какой страны «РРР»?",
    "Which country's film is RRR?",
    [
      { uz: "Hindiston", ru: "Индия", en: "India", correct: true },
      { uz: "Pakistan", ru: "Пакистан", en: "Pakistan", correct: false },
      { uz: "Bangladesh", ru: "Бангладеш", en: "Bangladesh", correct: false },
      { uz: "Nepal", ru: "Непал", en: "Nepal", correct: false },
    ]
  ),
  // 87 — frame placeholder
  q(
    "Bu kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "The Batman (2022)", ru: "Бэтмен (2022)", en: "The Batman (2022)", correct: true },
      { uz: "The Dark Knight", ru: "Тёмный рыцарь", en: "The Dark Knight", correct: false },
      { uz: "Joker", ru: "Джокер", en: "Joker", correct: false },
      { uz: "Batman Begins", ru: "Бэтмен: Начало", en: "Batman Begins", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 88 — text
  q(
    "Oppenheimer qaysi fizik haqida?",
    "О каком физике фильм «Оппенгеймер»?",
    "Which physicist is Oppenheimer about?",
    [
      { uz: "J. Robert Oppenheimer", ru: "Роберт Оппенгеймер", en: "J. Robert Oppenheimer", correct: true },
      { uz: "Albert Einstein", ru: "Альберт Эйнштейн", en: "Albert Einstein", correct: false },
      { uz: "Richard Feynman", ru: "Ричард Фейнман", en: "Richard Feynman", correct: false },
      { uz: "Niels Bohr", ru: "Нильс Бор", en: "Niels Bohr", correct: false },
    ]
  ),
  // 89 — text
  q(
    "Barbie (2023) qaysi studiya tomonidan ishlab chiqarilgan?",
    "Какой студией выпущен «Барби» (2023)?",
    "Which studio released Barbie (2023)?",
    [
      { uz: "Warner Bros.", ru: "Warner Bros.", en: "Warner Bros.", correct: true },
      { uz: "Disney", ru: "Disney", en: "Disney", correct: false },
      { uz: "Universal", ru: "Universal", en: "Universal", correct: false },
      { uz: "Paramount", ru: "Paramount", en: "Paramount", correct: false },
    ]
  ),
  // 90 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Oppenheimer", ru: "Оппенгеймер", en: "Oppenheimer", correct: true },
      { uz: "Inception", ru: "Начало", en: "Inception", correct: false },
      { uz: "Interstellar", ru: "Интерстеллар", en: "Interstellar", correct: false },
      { uz: "Tenet", ru: "Довод", en: "Tenet", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 91 — text
  q(
    "Killers of the Flower Moon qaysi kitob asosida?",
    "По какой книге снят «Убийцы цветочной луны»?",
    "What book is Killers of the Flower Moon based on?",
    [
      { uz: "David Grann — Killers of the Flower Moon", ru: "Дэвид Гранн", en: "David Grann — Killers of the Flower Moon", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Stephen King", ru: "Стивен Кинг", en: "Stephen King", correct: false },
      { uz: "True story, no book", ru: "Реальная история, без книги", en: "True story, no book", correct: false },
    ]
  ),
  // 92 — text
  q(
    "The Holdovers qaysi yil voqealarida?",
    "В каком году происходят события «Оставшихся»?",
    "What year is The Holdovers set in?",
    [
      { uz: "1970", ru: "1970", en: "1970", correct: true },
      { uz: "1980", ru: "1980", en: "1980", correct: false },
      { uz: "1965", ru: "1965", en: "1965", correct: false },
      { uz: "1975", ru: "1975", en: "1975", correct: false },
    ]
  ),
  // 93 — frame placeholder
  q(
    "Quyidagi kadr qaysi filmdan?",
    "Из какого фильма этот кадр?",
    "Which movie is this frame from?",
    [
      { uz: "Poor Things", ru: "Бедные вещи", en: "Poor Things", correct: true },
      { uz: "The Favourite", ru: "Фаворитка", en: "The Favourite", correct: false },
      { uz: "The Lobster", ru: "Лобстер", en: "The Lobster", correct: false },
      { uz: "The Killing of a Sacred Deer", ru: "Убийство священного оленя", en: "The Killing of a Sacred Deer", correct: false },
    ],
    PLACEHOLDER_FRAME
  ),
  // 94 — text
  q(
    "Anatomy of a Fall qaysi til filmi?",
    "На каком языке фильм «Анатомия падения»?",
    "What language is Anatomy of a Fall in?",
    [
      { uz: "Fransuz", ru: "Французский", en: "French", correct: true },
      { uz: "Ingliz", ru: "Английский", en: "English", correct: false },
      { uz: "Nemischa", ru: "Немецкий", en: "German", correct: false },
      { uz: "Ispan", ru: "Испанский", en: "Spanish", correct: false },
    ]
  ),
  // 95 — text
  q(
    "Zone of Interest qaysi yozuvchi asariga asoslangan?",
    "По какому произведению снят «Зона интересов»?",
    "What is The Zone of Interest based on?",
    [
      { uz: "Martin Amis — The Zone of Interest", ru: "Мартин Эмис", en: "Martin Amis — The Zone of Interest", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Primo Levi", ru: "Примо Леви", en: "Primo Levi", correct: false },
      { uz: "Elie Wiesel", ru: "Эли Визель", en: "Elie Wiesel", correct: false },
    ]
  ),
  // 96 — actors placeholder
  q(
    "Bu aktyorlar birga qaysi filmda ishtirok etgan?",
    "В каком фильме вместе снялись эти актёры?",
    "In which film did these actors appear together?",
    [
      { uz: "Poor Things", ru: "Бедные вещи", en: "Poor Things", correct: true },
      { uz: "The Favourite", ru: "Фаворитка", en: "The Favourite", correct: false },
      { uz: "The Lobster", ru: "Лобстер", en: "The Lobster", correct: false },
      { uz: "Cruella", ru: "Круэлла", en: "Cruella", correct: false },
    ],
    [...PLACEHOLDER_ACTORS]
  ),
  // 97 — text
  q(
    "Past Lives qaysi rejissyor filmi?",
    "Кто режиссёр «Прошлых жизней»?",
    "Who directed Past Lives?",
    [
      { uz: "Celine Song", ru: "Селин Сон", en: "Celine Song", correct: true },
      { uz: "Bong Joon-ho", ru: "Пон Чжун Хо", en: "Bong Joon-ho", correct: false },
      { uz: "Lee Isaac Chung", ru: "Ли Айзек Чун", en: "Lee Isaac Chung", correct: false },
      { uz: "Lulu Wang", ru: "Лулу Ван", en: "Lulu Wang", correct: false },
    ]
  ),
  // 98 — text
  q(
    "American Fiction qaysi roman asosida?",
    "По какому роману снят «Американская беллетристика»?",
    "What novel is American Fiction based on?",
    [
      { uz: "Percival Everett — Erasure", ru: "Персиваль Эверетт — Стирание", en: "Percival Everett — Erasure", correct: true },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
      { uz: "Colson Whitehead", ru: "Колсон Уайтхед", en: "Colson Whitehead", correct: false },
      { uz: "James McBride", ru: "Джеймс Макбрайд", en: "James McBride", correct: false },
    ]
  ),
  // 99 — text
  q(
    "Maestro (2023) qaysi shaxs haqida?",
    "О ком фильм «Маэстро» (2023)?",
    "Who is Maestro (2023) about?",
    [
      { uz: "Leonard Bernstein", ru: "Леонард Бернстайн", en: "Leonard Bernstein", correct: true },
      { uz: "Herbert von Karajan", ru: "Герберт фон Караян", en: "Herbert von Karajan", correct: false },
      { uz: "Arturo Toscanini", ru: "Артуро Тосканини", en: "Arturo Toscanini", correct: false },
      { uz: "Gustavo Dudamel", ru: "Густаво Дудамель", en: "Gustavo Dudamel", correct: false },
    ]
  ),
  // 100 — text
  q(
    "The Color Purple (2023) qaysi roman asosida?",
    "По какому роману снят «Цвет пурпурный» (2023)?",
    "What novel is The Color Purple (2023) based on?",
    [
      { uz: "Alice Walker — The Color Purple", ru: "Элис Уокер", en: "Alice Walker — The Color Purple", correct: true },
      { uz: "Toni Morrison", ru: "Тони Моррисон", en: "Toni Morrison", correct: false },
      { uz: "Maya Angelou", ru: "Майя Энджелоу", en: "Maya Angelou", correct: false },
      { uz: "Original", ru: "Оригинал", en: "Original", correct: false },
    ]
  ),
];

// Load existing, append, write back
const moviesPath = path.join(__dirname, "../questions/movies-new.json");
const data = JSON.parse(fs.readFileSync(moviesPath, "utf8"));
if (!Array.isArray(data)) throw new Error("movies-new.json must be an array");
const total = data.length + newQuestions.length;
data.push(...newQuestions);
fs.writeFileSync(moviesPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Added ${newQuestions.length} questions. Total: ${total}`);
