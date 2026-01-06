# MongoDB Atlas Sozlash - O'zbek Tilida Qo'llanma

## 📚 MongoDB nima?

MongoDB - bu ma'lumotlar bazasi (database). Sizning backend'ingiz barcha ma'lumotlarni (foydalanuvchilar, kategoriyalar, savollar) shu yerda saqlaydi.

**MongoDB Atlas** - bu MongoDB'ning bepul cloud versiyasi. Sizga MongoDB'ni kompyuteringizga o'rnatish shart emas!

---

## 🚀 MongoDB Atlas Sozlash (Qadam-baqadam)

### 1-QADAM: Ro'yxatdan O'tish

1. https://www.mongodb.com/cloud/atlas saytiga kiring
2. **"Try Free"** yoki **"Sign Up"** tugmasini bosing
3. Email va parol bilan ro'yxatdan o'ting (bepul)

---

### 2-QADAM: Cluster Yaratish

1. Ro'yxatdan o'tgandan keyin, **"Build a Database"** tugmasini bosing
2. **"M0 FREE"** (bepul) variantini tanlang
3. Cloud provider va region tanlang (masalan: AWS, us-east-1)
4. Cluster nomini o'zgartirishingiz mumkin (yoki default qoldiring)
5. **"Create"** tugmasini bosing
6. 1-2 daqiqa kutib turing (cluster yaratilmoqda)

---

### 3-QADAM: Database Foydalanuvchisi Yaratish

1. Cluster yaratilgandan keyin, **"Database Access"** (chap menuda) ni bosing
2. **"Add New Database User"** tugmasini bosing
3. **Authentication Method:** "Password" ni tanlang
4. **Username:** o'zingizga qulay username yozing (masalan: `quizuser`)
5. **Password:** kuchli parol yarating (yoki **"Autogenerate Secure Password"** ni bosing)
6. **Database User Privileges:** "Atlas admin" ni tanlang
7. **"Add User"** tugmasini bosing
8. **MUHIM:** Parolni yozib oling yoki saqlang! Keyinroq kerak bo'ladi!

---

### 4-QADAM: Network Access Sozlash (Muhim!)

1. **"Network Access"** (chap menuda) ni bosing
2. **"Add IP Address"** tugmasini bosing
3. **"Allow Access from Anywhere"** tugmasini bosing
   - Bu `0.0.0.0/0` IP manzilini qo'shadi
   - Bu Railway va boshqa joylardan kirishga ruxsat beradi
4. **"Confirm"** tugmasini bosing

**Nima uchun kerak?** Railway'dan MongoDB'ga ulanish uchun ruxsat kerak!

---

### 5-QADAM: Connection String Olish

1. **"Database"** (chap menuda) → **"Connect"** tugmasini bosing
2. **"Connect your application"** ni tanlang
3. **Driver:** "Node.js" ni tanlang
4. **Version:** eng so'nggi versiyani tanlang
5. Quyidagidek connection string ko'rasiz:

```
mongodb+srv://quizuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **MUHIM:** `<password>` o'rniga 3-qadamda yaratgan parolingizni qo'ying!
7. Database nomini qo'shing: oxiriga `/smart-quiz` qo'shing:

```
mongodb+srv://quizuser:yourpassword@cluster0.xxxxx.mongodb.net/smart-quiz?retryWrites=true&w=majority
```

**Misol:**

```
mongodb+srv://quizuser:MyPassword123@cluster0.abc123.mongodb.net/smart-quiz?retryWrites=true&w=majority
```

---

### 6-QADAM: Railway'ga Connection String Qo'shish

1. Railway dashboard'ga kiring
2. Project'ingizni tanlang
3. **"Variables"** bo'limiga kiring
4. **"New Variable"** tugmasini bosing
5. Quyidagilarni qo'shing:

**Variable 1:**

- **Name:** `MONGODB_URI`
- **Value:** 5-qadamda olgan connection string'ingiz
- **"Add"** tugmasini bosing

**Variable 2:**

- **Name:** `JWT_SECRET`
- **Value:** Har qanday uzun kalit (masalan: `my-super-secret-jwt-key-2024-minimum-32-chars`)
- **"Add"** tugmasini bosing

**Variable 3:**

- **Name:** `PORT`
- **Value:** `3000`
- **"Add"** tugmasini bosing

---

### 7-QADAM: Redeploy Qilish

1. Railway dashboard'da **"Deployments"** bo'limiga kiring
2. **"Redeploy"** tugmasini bosing
3. Yoki GitHub'ga yangi commit push qiling

---

## ✅ Tekshirish

2-3 daqiqa kutib, keyin Postman yoki brauzerda tekshiring:

```
GET https://quiz-app-backend-production-cd1c.up.railway.app/health
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

## 📸 Qadam-baqadam Screenshot'lar

### 1. Cluster Yaratish

- "Build a Database" → "M0 FREE" → "Create"

### 2. Database User

- "Database Access" → "Add New Database User"
- Username va Password yarating

### 3. Network Access

- "Network Access" → "Add IP Address"
- "Allow Access from Anywhere" → "Confirm"

### 4. Connection String

- "Database" → "Connect" → "Connect your application"
- Connection string ni oling va password ni almashtiring

---

## ⚠️ Muhim Eslatmalar

1. **Parolni Yozib Oling:** Database user parolini yozib oling, keyinroq kerak bo'ladi
2. **Network Access:** Mutlaqo "Allow Access from Anywhere" ni tanlang
3. **Connection String:** Password ni to'g'ri almashtiring
4. **Database Nomi:** Connection string oxiriga `/smart-quiz` qo'shing

---

## 🐛 Muammolar

### Muammo: "Authentication failed"

- **Yechim:** Connection string'dagi password to'g'ri emas. Database Access'da parolni tekshiring

### Muammo: "Network is unreachable"

- **Yechim:** Network Access'da "Allow Access from Anywhere" ni tanlang

### Muammo: "Connection timeout"

- **Yechim:** Network Access sozlamalarini tekshiring va 2-3 daqiqa kutib qayta urinib ko'ring

---

## 💡 Foydali Maslahatlar

1. **Bepul Tier:** M0 FREE tier bepul va kifoya qiladi
2. **Parol Xavfsizligi:** Kuchli parol yarating yoki autogenerate ishlating
3. **Connection String:** Parolni almashtirishni unutmang!
4. **Database Nomi:** `/smart-quiz` database nomi - siz xohlagan nomni berishingiz mumkin

---

## 📝 Qisqa Xotira

1. ✅ MongoDB Atlas'da ro'yxatdan o'ting
2. ✅ M0 FREE cluster yarating
3. ✅ Database user yarating (username + password)
4. ✅ Network Access'da "Allow Access from Anywhere" ni tanlang
5. ✅ Connection string oling va password ni almashtiring
6. ✅ Database nomini qo'shing (`/smart-quiz`)
7. ✅ Railway Variables'ga qo'shing (MONGODB_URI, JWT_SECRET, PORT)
8. ✅ Redeploy qiling

---

## 🎯 Tugallandi!

Agar barcha qadamlarni bajardigan bo'lsangiz, backend'ingiz MongoDB bilan ishlaydi va 502 xatosi yo'qoladi!

Agar muammo bo'lsa, Railway dashboard'da Logs'ni ko'ring va xatolarni yuboring.
