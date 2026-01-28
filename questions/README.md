# Savollar JSON Format Qo'llanmasi

Bu papkada siz o'z savollaringizni JSON formatida yozishingiz mumkin.

## 📁 Struktura

```
questions/
  ├── movies.json          # Movies kategoriyasi uchun savollar
  ├── science.json         # Science kategoriyasi uchun savollar
  └── ...
```

## 📝 JSON Format

Har bir JSON fayl **array** formatida bo'lishi kerak. Har bir element bir savol.

### Namuna:

```json
[
  {
    "question": {
      "uz": "Savol matni o'zbek tilida",
      "ru": "Текст вопроса на русском",
      "en": "Question text in English"
    },
    "options": [
      {
        "text": {
          "uz": "Birinchi variant o'zbek tilida",
          "ru": "Первый вариант на русском",
          "en": "First option in English"
        },
        "isCorrect": false
      },
      {
        "text": {
          "uz": "Ikkinchi variant o'zbek tilida",
          "ru": "Второй вариант на русском",
          "en": "Second option in English"
        },
        "isCorrect": true
      },
      {
        "text": {
          "uz": "Uchinchi variant o'zbek tilida",
          "ru": "Третий вариант на русском",
          "en": "Third option in English"
        },
        "isCorrect": false
      },
      {
        "text": {
          "uz": "To'rtinchi variant o'zbek tilida",
          "ru": "Четвертый вариант на русском",
          "en": "Fourth option in English"
        },
        "isCorrect": false
      }
    ],
    "image": null
  }
]
```

## ⚠️ Qoidalar

1. **Har bir savol aynan 4 ta variantga ega bo'lishi kerak**
2. **Aynan bitta variant `isCorrect: true` bo'lishi kerak**
3. **Barcha tillar (uz, ru, en) bo'lishi kerak**
4. **`image` maydoni ixtiyoriy** (null yoki URL)

## 🚀 Qanday ishlatish

### 1. JSON fayl yarating

`questions/movies.json` faylini yarating va yuqoridagi formatda savollar yozing.

### 2. Import qiling

```bash
node scripts/importQuestionsFromJSON.js questions/movies.json
```

Agar kategoriya ID ni ko'rsatmoqchi bo'lsangiz:

```bash
node scripts/importQuestionsFromJSON.js questions/movies.json <categoryId>
```

### 3. Natijani ko'ring

Skript:
- ✅ Muvaffaqiyatli qo'shilgan savollar sonini
- ⏭️  O'tkazib yuborilgan (mavjud) savollar sonini
- ❌ Xatolar sonini ko'rsatadi

## 💡 Maslahatlar

1. **Kichik miqdordan boshlang**: Avval 2-3 ta savol bilan test qiling
2. **Validatsiya**: Skript avtomatik validatsiya qiladi
3. **Takrorlanish**: Agar savol allaqachon mavjud bo'lsa, o'tkazib yuboriladi
4. **Backup**: Import qilishdan oldin MongoDB backup oling

## 📋 Namuna fayl

`scripts/questions-template.json` faylida to'liq namuna mavjud.
