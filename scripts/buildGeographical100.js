const fs = require("fs");
const path = require("path");

const newPath = path.join(__dirname, "../questions/geographical-new.json");
const outPath = path.join(__dirname, "../questions/geographical.json");

const base = JSON.parse(fs.readFileSync(newPath, "utf8"));

const more = [
  { q: { uz: "Qaysi hayvonlar yerdagi eng katta sutemizuvchilar?", ru: "Какие самые большие наземные млекопитающие?", en: "Which are the largest land mammals?" }, c: "Fil, karkidon, begemot", w: ["Yo'lbars, bo'ri, ayiq", "Ilon, kaltakesak, qurbaqa", "Kaptar, chumchuq, qarg'a"] },
  { q: { uz: "Dunyodagi eng chuqur okean chuqurligi qayerda?", ru: "Где самая глубокая океанская впадина?", en: "Where is the deepest ocean trench?" }, c: "Mariyana xandaqi (Tinch okeani)", w: ["Atlantika", "Hind okeani", "Shimoliy Muz okeani"] },
  { q: { uz: "Qaysi qushlar ucha olmaydi?", ru: "Какие птицы не умеют летать?", en: "Which birds cannot fly?" }, c: "Tuyaqush, pingvin, emu", w: ["Burgut, lochin, turna", "Qaldirg'och, chumchuq", "O'rdak, g'o z"] },
  { q: { uz: "Eng katta qit'a qaysi?", ru: "Какой континент самый большой?", en: "Which is the largest continent?" }, c: "Osiyo", w: ["Afrika", "Shimoliy Amerika", "Janubiy Amerika"] },
  { q: { uz: "Qaysi hayvonlar ikki marta hayot kechiradi (metamorfoz)?", ru: "Какие животные проходят метаморфоз?", en: "Which animals undergo metamorphosis?" }, c: "Kapa, qurbaqa, libella", w: ["It, mushuk, quyon", "Sigir, qo'y, echki", "Tovuq, o'rdak, g'o z"] },
  { q: { uz: "Dunyodagi eng katta orol qaysi?", ru: "Какой самый большой остров в мире?", en: "What is the largest island in the world?" }, c: "Grenlandiya", w: ["Madagaskar", "Borneo", "Yangi Gvineya"] },
  { q: { uz: "Qaysi hayvonlar uyquda qishlaydi?", ru: "Какие животные впадают в спячку?", en: "Which animals hibernate?" }, c: "Ayiq, sichqon, echki", w: ["Sher, yo'lbars, leopard", "Fil, jirafa, zebra", "Delfin, kit, tyulen"] },
  { q: { uz: "Eng katta dengiz (yopiq suv) qaysi?", ru: "Какое море самое большое (замкнутое)?", en: "Which is the largest enclosed sea?" }, c: "Kaspiy dengizi", w: ["O'rta yer", "Qora dengiz", "Qizil dengiz"] },
  { q: { uz: "Qaysi hasharotlar asal yig'adi?", ru: "Какие насекомые собирают мёд?", en: "Which insects collect honey?" }, c: "Ari", w: ["Chivin", "Chayon", "O'rgimchak"] },
  { q: { uz: "Dunyodagi eng baland vodiy qaysi?", ru: "Какая долина самая высокая в мире?", en: "What is the highest valley in the world?" }, c: "Tibet platosi", w: ["Grand Kanyon", "Rift vodiysi", "Indus vodiysi"] },
  { q: { uz: "Eng tez uchadigan qush qaysi?", ru: "Какая птица летает быстрее всех?", en: "Which bird flies the fastest?" }, c: "Lochin (sapsan)", w: ["Qarg'a", "Kaptar", "Chumchuq"] },
  { q: { uz: "Qaysi hayvonlar teri orqali nafas oladi?", ru: "Какие животные дышат кожей?", en: "Which animals breathe through skin?" }, c: "Qurbaqa, salamandra", w: ["Mushuk, it", "Qush, sudraluvchilar", "Baliq, akula"] },
  { q: { uz: "Dunyodagi eng katta tropik yomg'ir o'rmoni qayerda?", ru: "Где самый большой тропический дождевой лес?", en: "Where is the largest tropical rainforest?" }, c: "Amazonka (Janubiy Amerika)", w: ["Kongo", "Indoneziya", "Avstraliya"] },
  { q: { uz: "Qaysi hayvonlar xorda (qovurg'asiz) yashaydi?", ru: "Какие животные живут без позвоночника?", en: "Which animals have no backbone?" }, c: "Ari, chayon, o'rgimchak", w: ["Baliq, ilon, qurbaqa", "Qush, sutemizuvchi", "Kaltakesak, timsoh"] },
  { q: { uz: "Eng kichik qit'a qaysi?", ru: "Какой континент самый маленький?", en: "Which is the smallest continent?" }, c: "Avstraliya", w: ["Antarktida", "Yevropa", "Okeaniya"] },
  { q: { uz: "Qaysi sutemizuvchilar parvooz qiladi?", ru: "Какие млекопитающие умеют летать?", en: "Which mammals can fly?" }, c: "Yarasa", w: ["Sincap (planer)", "Suv sichqoni", "Delfin"] },
  { q: { uz: "Dunyodagi eng uzun tog' tizmasi qaysi?", ru: "Какой самый длинный горный хребет?", en: "What is the longest mountain range?" }, c: "Andlar (Janubiy Amerika)", w: ["Himalay", "Alp", "Ural"] },
  { q: { uz: "Qaysi hayvonlar yilning yarmini suvda, yarmini quruqda o'tkazadi?", ru: "Какие животные проводят полгода в воде, полгода на суше?", en: "Which animals spend half the year in water, half on land?" }, c: "Tyulen, mors", w: ["Timsoh, ilon", "Qurbaqa, salamandra", "Kit, delfin"] },
  { q: { uz: "Eng ko'p tillar so'zlashadigan davlat qaysi?", ru: "В какой стране говорят на самом большом количестве языков?", en: "Which country has the most languages?" }, c: "Papua-Yangi Gvineya", w: ["Hindiston", "Indoneziya", "Nigeriya"] },
  { q: { uz: "Qaysi hayvonlar ovoz orqali yo'nalish topadi?", ru: "Какие животные ориентируются по звуку?", en: "Which animals navigate by sound?" }, c: "Yarasa, delfin", w: ["Fil, sher", "Qush, hasharot", "Baliq, ilon"] },
  { q: { uz: "Dunyodagi eng katta ko'l (chirindisi) qaysi?", ru: "Какое озеро самое большое (пресное)?", en: "What is the largest freshwater lake?" }, c: "Baykal (hajmi bo'yicha)", w: ["Viktoriya", "Superior", "Kaspiy"] },
  { q: { uz: "Qaysi jonzotlar regeneratsiya qiladi (qismi o'sadi)?", ru: "Какие существа регенерируют части тела?", en: "Which creatures can regenerate body parts?" }, c: "Ilon (dum), salamandra", w: ["Fil, jirafa", "Qush, baliq", "Ari, chayon"] },
  { q: { uz: "Eng issiq cho'l qaysi?", ru: "Какая пустыня самая жаркая?", en: "Which desert is the hottest?" }, c: "Lut (Eron), Sahara", w: ["Gobi", "Atakama", "Arab"] },
  { q: { uz: "Qaysi hayvonlar migratsiya qiladi (masofaga uchib/yuradi)?", ru: "Какие животные мигрируют на большие расстояния?", en: "Which animals migrate long distances?" }, c: "Turna, monarch kapalak, kit", w: ["Tovuq, kaptar", "Ilon, kaltakesak", "O'rgimchak, ari"] },
  { q: { uz: "Dunyodagi eng katta vulkan qaysi?", ru: "Какой вулкан самый большой в мире?", en: "What is the largest volcano in the world?" }, c: "Mauna Loa (Gavayi)", w: ["Vezuviy", "Fuji", "Klyuchevskaya"] },
  { q: { uz: "Qaysi hayvonlar yirtqich va o't-o'lan bilan oziqlanadi?", ru: "Какие животные едят и мясо, и растения?", en: "Which animals eat both meat and plants?" }, c: "Ayiq, tulki, cho'chqa", w: ["Arslon, yo'lbars", "Fil, kiyik", "Ilon, akula"] },
  { q: { uz: "Eng katta yarim orol qaysi?", ru: "Какой полуостров самый большой?", en: "What is the largest peninsula?" }, c: "Arabiston yarim oroli", w: ["Hindiston", "Skandinaviya", "Labrador"] },
  { q: { uz: "Qaysi hayvonlar suvda ham, quruqda ham yashaydi?", ru: "Какие животные живут и в воде, и на суше?", en: "Which animals live both in water and on land?" }, c: "Qurbaqa, timsoh, tyulen", w: ["Kit, delfin", "Qush, mushuk", "Ari, chayon"] },
  { q: { uz: "Dunyodagi eng katta muzlik qayerda?", ru: "Где самый большой ледник в мире?", en: "Where is the largest glacier?" }, c: "Antarktida (Lambert)", w: ["Grenlandiya", "Alaska", "Himalay"] },
  { q: { uz: "Eng katta kemiruvchi qaysi?", ru: "Какой грызун самый большой?", en: "What is the largest rodent?" }, c: "Kapibara", w: ["Sichqon", "Ochqon", "Suv sichqoni"] },
  { q: { uz: "Qaysi okean eng chuqur?", ru: "Какой океан самый глубокий?", en: "Which ocean is the deepest?" }, c: "Tinch okeani", w: ["Atlantika", "Hind", "Shimoliy Muz"] },
  { q: { uz: "Qaysi hayvonlar koloniya (uyalar) quradi?", ru: "Какие животные строят колонии (ульи)?", en: "Which animals build colonies (hives)?" }, c: "Ari, termit, chivin", w: ["Qush, baliq", "Bo'ri, sher", "Ilon, kaltakesak"] },
  { q: { uz: "Dunyodagi eng katta daryo (hajmi) qaysi?", ru: "Какая река самая полноводная?", en: "Which river has the largest volume?" }, c: "Amazonka", w: ["Nil", "Yanszi", "Mississippi"] },
  { q: { uz: "Qaysi hayvonlar changda cho'kadi (cho'kindi)?", ru: "Какие животные купаются в пыли?", en: "Which animals dust bathe?" }, c: "Tovuq, fillar, maymun", w: ["Baliq, kit", "Ilon, qurbaqa", "Ari, chayon"] },
  { q: { uz: "Eng baland sharshara qaysi?", ru: "Какой водопад самый высокий?", en: "What is the tallest waterfall?" }, c: "Angel (Venesuela)", w: ["Niagara", "Viktoriya", "Iguasu"] },
  { q: { uz: "Qaysi jonzotlar elektrik zarba beradi?", ru: "Какие существа бьют током?", en: "Which creatures produce electric shock?" }, c: "Elektrik ilon baliq, skat", w: ["Akula, timsoh", "Ari, chayon", "Qurbaqa, ilon"] },
  { q: { uz: "Dunyodagi eng katta o'rmon (yuzasi) qayerda?", ru: "Где самый большой лес по площади?", en: "Where is the largest forest by area?" }, c: "Sibir (taiga)", w: ["Amazonka", "Kongo", "Kanada"] },
  { q: { uz: "Qaysi hayvonlar tuxumdan chiqadi lekin sut bilan oziqlanadi?", ru: "Какие животные вылупляются из яйца, но питаются молоком?", en: "Which animals hatch from egg but feed on milk?" }, c: "Tuxumqotar (ekidna, ornitorenk)", w: ["Qush", "Baliq", "Ilon"] },
  { q: { uz: "Eng katta qit'alararo tog' tizmasi qaysi?", ru: "Какой межконтинентальный хребет самый большой?", en: "What is the largest intercontinental range?" }, c: "O'rta okean tizmasi", w: ["Himalay", "Andlar", "Alp"] },
  { q: { uz: "Qaysi hayvonlar o'zini dushmandan yashiradi (kamuflyaj)?", ru: "Какие животные маскируются от врагов?", en: "Which animals camouflage from predators?" }, c: "Baboq, yo'lbars, chayon", w: ["Fil, jirafa", "Tovuq, o'rdak", "It, mushuk"] },
  { q: { uz: "Dunyodagi eng qurg'oqchil joy qayerda?", ru: "Где самое сухое место на Земле?", en: "Where is the driest place on Earth?" }, c: "Atakama (Chili), Antarktida", w: ["Sahara", "Arabiston", "Gobi"] },
  { q: { uz: "Eng katta dengiz sutemizuvchisi qaysi?", ru: "Какое морское млекопитающее самое большое?", en: "What is the largest marine mammal?" }, c: "Ko'k kit", w: ["Fil", "Akula", "Timsoh"] },
  { q: { uz: "Qaysi qushlar dengizda ko'p vaqt o'tkazadi?", ru: "Какие птицы проводят много времени в море?", en: "Which birds spend much time at sea?" }, c: "Albatros, suv qushi, pingvin", w: ["Tovuq, kaptar", "Burgut, lochin", "Qarg'a, chumchuq"] },
  { q: { uz: "Eng katta arhipelag qaysi?", ru: "Какой архипелаг самый большой?", en: "What is the largest archipelago?" }, c: "Indoneziya (Malay arhipelagi)", w: ["Yaponiya", "Filippin", "Karib"] },
  { q: { uz: "Qaysi hayvonlar qishda qor ostida yashaydi?", ru: "Какие животные живут под снегом зимой?", en: "Which animals live under snow in winter?" }, c: "Sichqon, quyon, bo'rsiq", w: ["Sher, ayiq", "Fil, jirafa", "Baliq, ilon"] },
  { q: { uz: "Dunyodagi eng baland shahar qaysi?", ru: "Какой город самый высокогорный?", en: "What is the highest city in the world?" }, c: "La-Ras (Boliviya)", w: ["Lhasa", "Kito", "Bogota"] },
  { q: { uz: "Qaysi jonzotlar bioluminescensiya (yorug'lik) chiqaradi?", ru: "Какие существа светятся (биолюминесценция)?", en: "Which creatures produce bioluminescence?" }, c: "Kuniga qurti, dengiz meduzasi, chuvalchang", w: ["Ari, chivin", "Mushuk, it", "Qush, baliq"] },
  { q: { uz: "Eng katta platolar qaysi?", ru: "Какие плато самые большие?", en: "What are the largest plateaus?" }, c: "Tibet, Dekan, Kolumbiya", w: ["Alp, Kavkaz", "Sahara", "Amazonka"] },
  { q: { uz: "Qaysi hayvonlar suvni filtrlaydi (ozuqa oladi)?", ru: "Какие животные фильтруют воду для питания?", en: "Which animals filter water for food?" }, c: "Kit, molyusk, g'umbak", w: ["Akula, timsoh", "Qurbaqa, ilon", "Qush, sutemizuvchi"] },
  { q: { uz: "Dunyodagi eng uzun qirg'oq chizig'iga ega davlat qaysi?", ru: "У какой страны самая длинная береговая линия?", en: "Which country has the longest coastline?" }, c: "Kanada", w: ["Indoneziya", "Rossiya", "Avstraliya"] },
  { q: { uz: "Eng katta sudraluvchi qaysi?", ru: "Какая рептилия самая большая?", en: "What is the largest reptile?" }, c: "Timsoh (tuzli suv)", w: ["Ilon anakonda", "Kaltakesak komodo", "Toshbaqa"] },
  { q: { uz: "Qaysi hayvonlar g'ozlar ketida uchar?", ru: "Какие птицы летают клином?", en: "Which birds fly in V-formation?" }, c: "G'o z, o'rdak, turna", w: ["Qarg'a, kaptar", "Burgut, lochin", "Tovuq, chumchuq"] },
  { q: { uz: "Eng katta yopiq havza (dengizga chiqmas) qaysi?", ru: "Какой бессточный бассейн самый большой?", en: "What is the largest endorheic basin?" }, c: "Kaspiy havzasi", w: ["Aral", "Chad", "Titikaka"] },
  { q: { uz: "Qaysi hayvonlar o'z uyasini loydan quradi?", ru: "Какие животные строят гнёзда из глины?", en: "Which animals build nests from mud?" }, c: "Qaldirg'och, laylak", w: ["Ari, asalari", "Qarg'a, kaptar", "Burgut, lochin"] },
  { q: { uz: "Dunyodagi eng issiq mintaqa qaysi?", ru: "Какой регион самый жаркий?", en: "Which region is the hottest?" }, c: "Dallol (Efiopiya), Lutf (Eron)", w: ["Sahara", "Gobi", "Arabiston"] },
  { q: { uz: "Eng katta qush (hajmi) qaysi?", ru: "Какая птица самая тяжёлая (летающая)?", en: "What is the heaviest flying bird?" }, c: "Jek (kori bustard)", w: ["Tuyaqush", "Burgut", "Lochin"] },
  { q: { uz: "Qaysi hayvonlar o'zini o'zi himoya qiladi (tikan, zahar)?", ru: "Какие животные защищаются иглами/ядом?", en: "Which animals defend with spines/venom?" }, c: "Kirpi, chayon, o'rgimchak", w: ["Quyon, kiyik", "Tovuq, o'rdak", "It, mushuk"] },
  { q: { uz: "Eng katta yarim orol (Yevropa) qaysi?", ru: "Какой полуостров самый большой в Европе?", en: "What is the largest peninsula in Europe?" }, c: "Skandinaviya", w: ["Iberiya", "Balkan", "Krim"] },
  { q: { uz: "Qaysi jonzotlar 3 yoki undan ortiq oyoqqa ega?", ru: "У каких существ больше трёх пар ног?", en: "Which creatures have more than 3 pairs of legs?" }, c: "Chayon, o'rgimchak, qisqichbaqa", w: ["Ari, chivin", "Qurbaqa, ilon", "Qush, sutemizuvchi"] },
  { q: { uz: "Dunyodagi eng katta ko'l (umuman) qaysi?", ru: "Какое озеро самое большое по площади?", en: "What is the largest lake by area?" }, c: "Kaspiy dengizi", w: ["Superior", "Viktoriya", "Baykal"] },
  { q: { uz: "Eng katta maymun qaysi?", ru: "Какая обезьяна самая большая?", en: "What is the largest ape?" }, c: "Gorilla", w: ["Shimpanze", "Orangutan", "Babuin"] },
  { q: { uz: "Qaysi hayvonlar suvda sakraydi?", ru: "Какие животные прыгают по воде?", en: "Which animals run on water?" }, c: "Basilis kaltakesak, qisqichbaqa", w: ["Qurbaqa", "Baliq", "It"] },
  { q: { uz: "Eng katta materik (yagona) qaysi?", ru: "Какой единый массив суши самый большой?", en: "What is the largest single landmass?" }, c: "Yevrosiyo (Yevropa + Osiyo)", w: ["Afrika", "Amerika", "Antarktida"] },
  { q: { uz: "Qaysi hayvonlar suvda yuzadi, lekin quruqda tug'iladi?", ru: "Какие животные плавают в воде, но рождаются на суше?", en: "Which animals swim but are born on land?" }, c: "Tyulen, dengiz fili", w: ["Kit, delfin", "Baliq, akula", "Qurbaqa, ilon"] },
  { q: { uz: "Dunyodagi eng katta gidroelektrostansiya qayerda?", ru: "Где самая большая ГЭС?", en: "Where is the largest hydroelectric dam?" }, c: "Sanxia (Yanszi, Xitoy)", w: ["Itaipu", "Guri", "Grand Kulye"] },
  { q: { uz: "Eng katta qush tuxumi qaysi hayvonnikiga tegishli?", ru: "У какой птицы самое большое яйцо?", en: "Which bird has the largest egg?" }, c: "Tuyaqush", w: ["Emu", "Pingvin", "Burgut"] },
  { q: { uz: "Qaysi hayvonlar chang va suvda yuradi?", ru: "Какие животные ходят по пыли и воде?", en: "Which animals walk on dust and water?" }, c: "O'rgimchak (suv), basilisk", w: ["Ilon", "Qurbaqa", "Baliq"] },
  { q: { uz: "Eng katta dengiz bo'g'ozi qaysi?", ru: "Какой пролив самый широкий?", en: "What is the widest strait?" }, c: "Dreyk bo'g'ozi", w: ["Gibraltar", "Bospor", "Malakka"] },
  { q: { uz: "Qaysi jonzotlar qon so'radi?", ru: "Какие существа питаются кровью?", en: "Which creatures feed on blood?" }, c: "Chivin, shaffof, vampir yarasa", w: ["Ari", "O'rgimchak", "Chayon"] },
  { q: { uz: "Dunyodagi eng baland suv havzasi qaysi?", ru: "Какое озеро самое высокогорное?", en: "What is the highest navigable lake?" }, c: "Titikaka", w: ["Baykal", "Viktoriya", "Superior"] },
  { q: { uz: "Eng katta yirtqich qush qaysi?", ru: "Какая хищная птица самая большая?", en: "What is the largest bird of prey?" }, c: "Kondor, burgut", w: ["Lochin", "Boyqush", "Qarg'a"] },
  { q: { uz: "Qaysi hayvonlar o'zini 'o'lik' ko'rsatadi?", ru: "Какие животные притворяются мёртвыми?", en: "Which animals play dead?" }, c: "Opossum, ba'zi ilonlar", w: ["Sher, yo'lbars", "Fil, jirafa", "Qush, baliq"] },
  { q: { uz: "Eng katta okean oqimi qaysi?", ru: "Какое океанское течение самое мощное?", en: "What is the strongest ocean current?" }, c: "Antarktika aylana oqimi", w: ["Golfstrim", "Kuroshio", "El-Nino"] },
  { q: { uz: "Qaysi hayvonlar qishda qor rangiga o'zgaradi?", ru: "Какие животные зимой становятся белыми?", en: "Which animals turn white in winter?" }, c: "Oq ayiq, oq bo'rsiq, ptarmigan", w: ["Yo'lbars", "Sher", "Fil"] },
  { q: { uz: "Dunyodagi eng katta muzlik tizimi qayerda?", ru: "Где самая большая ледниковая система?", en: "Where is the largest ice sheet?" }, c: "Antarktida", w: ["Grenlandiya", "Arktika", "Himalay"] },
  { q: { uz: "Eng katta hasharot qaysi?", ru: "Какое насекомое самое большое?", en: "What is the largest insect?" }, c: "Goliath qo'ng'izi, stick hasharot", w: ["Ari", "Chayon", "Chivin"] },
  { q: { uz: "Qaysi hayvonlar suvni ichiga oladi lekin chiqarmaydi?", ru: "Какие животные не пьют воду (получают из пищи)?", en: "Which animals get water only from food?" }, c: "Tuyaqush, ba'zi kemiruvchilar", w: ["Kit", "Fil", "It"] },
  { q: { uz: "Eng katta ekvatorial o'rmon qaysi?", ru: "Какой экваториальный лес самый большой?", en: "What is the largest equatorial forest?" }, c: "Amazonka yomg'ir o'rmoni", w: ["Kongo", "Indoneziya", "Malezija"] },
  { q: { uz: "Qaysi jonzotlar 4 ta qanotga ega?", ru: "У каких существ 4 крыла?", en: "Which creatures have 4 wings?" }, c: "Libella, kapalak, pashsha", w: ["Qush", "Yarasa", "Chivin"] },
  { q: { uz: "Dunyodagi eng katta delta qaysi daryoda?", ru: "У какой реки самая большая дельта?", en: "Which river has the largest delta?" }, c: "Ganges-Brahmaputra", w: ["Nil", "Amazonka", "Mississippi"] },
  { q: { uz: "Eng katta dengiz qushi qaysi?", ru: "Какая морская птица самая большая?", en: "What is the largest seabird?" }, c: "Albatros (qanot yoyi)", w: ["Pingvin", "Suv qushi", "Qarg'a"] },
  { q: { uz: "Qaysi hayvonlar o'z jinsi bo'yicha juftlashadi umr bo'yi?", ru: "Какие животные образуют пару на всю жизнь?", en: "Which animals mate for life?" }, c: "Burgut, bo'ri, delfin", w: ["Tovuq", "Ilon", "Ari"] },
  { q: { uz: "Eng katta yopiq dengiz qaysi?", ru: "Какое замкнутое море самое большое?", en: "What is the largest enclosed sea?" }, c: "O'rta yer dengizi", w: ["Qora dengiz", "Qizil dengiz", "Kaspiy"] },
  { q: { uz: "Qaysi hayvonlar o'z og'zida bolasini ko'taradi?", ru: "Какие животные носят детёнышей во рту?", en: "Which animals carry young in mouth?" }, c: "Timsoh, ba'zi baliqlar", w: ["Fil", "Sher", "Qush"] },
  { q: { uz: "Dunyodagi eng katta vulkanik orol qaysi?", ru: "Какой вулканический остров самый большой?", en: "What is the largest volcanic island?" }, c: "Islandiya", w: ["Yaponiya", "Indoneziya", "Havayi"] },
  { q: { uz: "Eng katta sutemizuvchi (quruqlik) qaysi?", ru: "Какое самое большое наземное млекопитающее?", en: "What is the largest land mammal?" }, c: "Afrika fili", w: ["Karkidon", "Begemot", "Jirafa"] },
  { q: { uz: "Qaysi hayvonlar suv ostida eng uzoq nafas tutadi?", ru: "Какие животные дольше всех задерживают дыхание под водой?", en: "Which animals hold breath longest underwater?" }, c: "Kit, tyulen, timsoh", w: ["Delfin", "Qurbaqa", "Baliq"] },
  { q: { uz: "Eng katta okean (yuzasi) qaysi?", ru: "Какой океан самый большой по площади?", en: "Which ocean has the largest area?" }, c: "Tinch okeani", w: ["Atlantika", "Hind", "Shimoliy Muz"] },
  { q: { uz: "Qaysi jonzotlar 8 oyoqqa ega?", ru: "У каких существ 8 ног?", en: "Which creatures have 8 legs?" }, c: "O'rgimchak, chayon", w: ["Ari", "Chivin", "Qisqichbaqa"] },
  { q: { uz: "Dunyodagi eng katta tropik orol qaysi?", ru: "Какой тропический остров самый большой?", en: "What is the largest tropical island?" }, c: "Borneo", w: ["Madagaskar", "Yangi Gvineya", "Sumatra"] },
  { q: { uz: "Eng katta dengiz (ochiq) qaysi?", ru: "Какое открытое море самое большое?", en: "What is the largest open sea?" }, c: "Filippin dengizi", w: ["O'rta yer", "Qora", "Qizil"] },
  { q: { uz: "Qaysi hayvonlar tuxumini boshqa qush uyasiga qo'yadi?", ru: "Какие птицы подкладывают яйца в чужие гнёзда?", en: "Which birds lay eggs in others' nests?" }, c: "Zog' (kukushka)", w: ["Qaldirg'och", "Kaptar", "Burgut"] },
  { q: { uz: "Eng baland faol vulkan qaysi?", ru: "Какой активный вулкан самый высокий?", en: "What is the tallest active volcano?" }, c: "Ojos del Salado (Chili)", w: ["Klyuchevskaya", "Fuji", "Kotopaksi"] },
  { q: { uz: "Qaysi hayvonlar qishda qish uyqusiga yotadi?", ru: "Какие животные впадают в зимнюю спячку?", en: "Which animals hibernate in winter?" }, c: "Ayiq, sichqon, echki", w: ["Sher", "Fil", "Delfin"] }
];

function opt(c, w, pos) {
  const all = [{ text: { uz: c, ru: c, en: c }, isCorrect: true }, ...w.map((x) => ({ text: { uz: x, ru: x, en: x }, isCorrect: false }))];
  const correct = all.shift();
  all.splice(pos, 0, correct);
  return all;
}

const lang = (o) => (typeof o === "string" ? { uz: o, ru: o, en: o } : o);

const toAdd = 100 - base.length;
for (let i = 0; i < toAdd && i < more.length; i++) {
  const m = more[i];
  const correctPos = (base.length + i) % 3 + 1;
  const options = opt(m.c, m.w, correctPos);
  base.push({
    question: lang(m.q),
    options: options.map((o) => ({ text: lang(o.text), isCorrect: o.isCorrect })),
    image: null,
  });
}

fs.writeFileSync(outPath, JSON.stringify(base, null, 2), "utf8");
console.log("geographical.json yozildi:", base.length, "ta savol");
