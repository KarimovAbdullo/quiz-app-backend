# Railway'ga Deploy Qilish Qo'llanmasi

## 🚀 Railway'ga Deploy Qilish (Qadam-baqadam)

### 1-QADAM: GitHub'ga Push Qilish

1. GitHub'da yangi repository yarating
2. Lokal loyihangizni git bilan initialize qiling:

```bash
git init
git add .
git commit -m "Initial commit - Smart Quiz Backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2-QADAM: Railway'da Project Yaratish

1. https://railway.app saytiga kiring
2. "Start a New Project" ni bosing
3. "Deploy from GitHub repo" ni tanlang
4. GitHub'ingizga ruxsat bering
5. Repository'ni tanlang va "Deploy" ni bosing

### 3-QADAM: Environment Variables (Muhim!)

Railway dashboard'da **Variables** bo'limiga kiring va quyidagilarni qo'shing:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-quiz
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
PORT=3000
```

**Muhim:**

- `MONGODB_URI` - MongoDB Atlas connection string (yoki boshqa MongoDB hosting)
- `JWT_SECRET` - Kuchli maxfiy kalit (kamida 32 belgi)
- `PORT` - Railway avtomatik beradi, lekin 3000 qoldirishingiz mumkin

### 4-QADAM: MongoDB Atlas Sozlash

1. MongoDB Atlas'da Database Access bo'limida foydalanuvchi yarating
2. Network Access bo'limida:
   - Railway IP'larini qo'shing
   - Yoki `0.0.0.0/0` qo'shib hamma joydan ruxsat bering (development uchun)
3. Connection string ni oling va Railway Variables'ga qo'shing

### 5-QADAM: Deploy Tekshirish

1. Railway dashboard'da **Deployments** bo'limiga kiring
2. Deploy jarayonini kuzating
3. **Settings** → **Generate Domain** ni bosing
4. Domain oling (masalan: `smart-quiz-production.up.railway.app`)

### 6-QADAM: API URL'ni Test Qilish

Brauzerda yoki Postman'da test qiling:

```
GET https://your-app-name.up.railway.app/health
```

Agar quyidagi javobni ko'rsangiz, hamma narsa to'g'ri:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📱 React Native Ilovangiz Uchun

### Base URL O'zgartirish

Railway'dan olgan domain'ingizni ishlating:

```javascript
// api.js faylida
const BASE_URL = "https://your-app-name.up.railway.app";
```

### Barcha API Endpoint'lar:

1. **Register:** `POST https://your-app-name.up.railway.app/auth/register`
2. **Login:** `POST https://your-app-name.up.railway.app/auth/login`
3. **Categories:** `GET https://your-app-name.up.railway.app/categories`
4. **Questions:** `GET https://your-app-name.up.railway.app/questions/:categoryId`
5. **Submit Answer:** `POST https://your-app-name.up.railway.app/questions/answer`

---

## ✅ Tekshirish Ro'yxati

- [ ] GitHub'ga push qilindi
- [ ] Railway'da project yaratildi
- [ ] Environment variables qo'shildi (MONGODB_URI, JWT_SECRET, PORT)
- [ ] MongoDB Atlas sozlandi (Network Access)
- [ ] Deploy muvaffaqiyatli yakunlandi
- [ ] Domain generatsiya qilindi
- [ ] Health check endpoint ishlayapti
- [ ] API endpoint'lar test qilindi

---

## 🐛 Muammolar va Yechimlar

### Muammo: "MongoDB connection error"

- **Yechim:** MongoDB Atlas'da Network Access'da Railway IP'larini qo'shing yoki `0.0.0.0/0` qo'shing

### Muammo: "Deploy failed"

- **Yechim:**
  - `package.json` da `start` script borligini tekshiring
  - Environment variables to'g'ri qo'shilganligini tekshiring
  - Logs'ni ko'rib xatolarni toping

### Muammo: "401 Unauthorized"

- **Yechim:** JWT_SECRET to'g'ri qo'shilganligini tekshiring

### Muammo: "CORS error"

- **Yechim:** Backend'da CORS allaqachon yoqilgan, lekin agar muammo bo'lsa, Railway Settings'da CORS sozlamalarini tekshiring

---

## 💡 Foydali Maslahatlar

1. **Free Tier:** Railway'da bepul tier bor, lekin cheklovlar mavjud
2. **Custom Domain:** Railway'da bepul custom domain qo'shishingiz mumkin
3. **Logs:** Railway dashboard'da real-time logs'ni ko'rishingiz mumkin
4. **Auto Deploy:** GitHub'ga push qilganingizda avtomatik deploy bo'ladi

---

## 📝 Environment Variables Misoli

Railway Variables bo'limida:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/smart-quiz?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-for-production-2024-minimum-32-chars
PORT=3000
```

**Muhim:** `.env` fayl GitHub'ga push qilinmaydi (`.gitignore` da). Railway'da Variables orqali qo'shishingiz kerak!
