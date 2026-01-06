# .env Fayl Sozlash Qo'llanmasi

## 📝 .env Fayl Nima?

`.env` fayl - bu environment variables (muhit o'zgaruvchilari) ni saqlash uchun fayl. Bu fayl **faqat lokal development** uchun kerak.

**Muhim:** Railway'da `.env` fayl ishlatilmaydi! Railway'da **Variables** bo'limida qo'shishingiz kerak.

---

## 🏠 Lokal Development Uchun (.env)

### 1. .env Fayl Yaratish

Loyiha ildizida (package.json yonida) `.env` nomli fayl yarating:

**Windows:**

- Notepad'da yangi fayl yarating
- `.env` nomi bilan saqlang (barcha fayllar ko'rinishida)

**Mac/Linux:**

```bash
touch .env
```

### 2. .env Faylga Quyidagilarni Qo'shing

`.env` faylga quyidagilarni yozing:

```
MONGODB_URI=mongodb+srv://a6510206a_db_user:YNrFrYsiZC90enyb@cluster0.nywxugn.mongodb.net/smart-quiz?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-2024-minimum-32-chars-long
PORT=3000
```

**Muhim:**

- `MONGODB_URI` - MongoDB Atlas connection string'ingiz
- `JWT_SECRET` - Kuchli maxfiy kalit (kamida 32 belgi)
- `PORT` - Server port (3000)

### 3. Tekshirish

Lokal server'ni ishga tushiring:

```bash
npm start
```

Agar quyidagilarni ko'rsangiz, hamma narsa to'g'ri:

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB successfully!
🚀 Server is running on port 3000
```

---

## ☁️ Railway Production Uchun (Variables)

Railway'da `.env` fayl ishlatilmaydi! Railway dashboard'da **Variables** bo'limida qo'shishingiz kerak.

### Railway Variables Qo'shish:

1. Railway dashboard → Project → **Variables**
2. **New Variable** tugmasini bosing
3. Quyidagilarni qo'shing:

**Variable 1:**

- Name: `MONGODB_URI`
- Value: `mongodb+srv://a6510206a_db_user:YNrFrYsiZC90enyb@cluster0.nywxugn.mongodb.net/smart-quiz?appName=Cluster0`

**Variable 2:**

- Name: `JWT_SECRET`
- Value: `my-super-secret-jwt-key-2024-minimum-32-chars-long`

**Variable 3:**

- Name: `PORT`
- Value: `3000`

---

## 🔒 Xavfsizlik

### .env Fayl Xavfsizligi:

1. `.env` fayl **GitHub'ga push qilinmaydi** (`.gitignore` da)
2. `.env` fayl faqat lokal kompyuteringizda
3. `.env.example` fayl yaratib, misol ko'rsatishingiz mumkin (parolsiz)

### Railway Variables Xavfsizligi:

1. Railway Variables xavfsiz saqlanadi
2. Faqat siz ko'rishingiz mumkin
3. GitHub'ga push qilinmaydi

---

## 📋 Tekshirish Ro'yxati

### Lokal Development:

- [ ] `.env` fayl yaratildi
- [ ] `MONGODB_URI` qo'shildi
- [ ] `JWT_SECRET` qo'shildi
- [ ] `PORT` qo'shildi
- [ ] Lokal server ishlayapti

### Railway Production:

- [ ] Railway Variables'da `MONGODB_URI` qo'shildi
- [ ] Railway Variables'da `JWT_SECRET` qo'shildi
- [ ] Railway Variables'da `PORT` qo'shildi
- [ ] Redeploy qilindi
- [ ] Server ishlayapti

---

## 🐛 Muammolar

### Muammo: ".env fayl ishlamayapti"

- **Yechim:** `.env` fayl loyiha ildizida (package.json yonida) bo'lishi kerak
- **Yechim:** `dotenv` paket o'rnatilganligini tekshiring: `npm install dotenv`

### Muammo: "MONGODB_URI is not defined"

- **Yechim:** `.env` faylda `MONGODB_URI` to'g'ri yozilganligini tekshiring
- **Yechim:** `.env` fayl nomi to'g'ri bo'lishi kerak (`.env`, `.env.local` emas)

### Muammo: "Railway'da ishlamayapti"

- **Yechim:** Railway Variables'da qo'shilganligini tekshiring
- **Yechim:** Redeploy qiling

---

## 💡 Maslahatlar

1. **Lokal Development:** `.env` fayl ishlating
2. **Production (Railway):** Variables ishlating
3. **Parol Xavfsizligi:** `.env` fayl GitHub'ga push qilinmaydi
4. **Misol:** `.env.example` fayl yaratib, misol ko'rsatishingiz mumkin

---

## ✅ Tugallandi!

Agar barcha qadamlarni bajardigan bo'lsangiz:

- Lokal development ishlaydi
- Railway production ishlaydi
- Xavfsizlik saqlanadi
