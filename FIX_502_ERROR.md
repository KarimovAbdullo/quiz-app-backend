# 502 Bad Gateway Xatosini Hal Qilish

## 🔴 Muammo: 502 Bad Gateway

Health check ishlayapti, lekin categories endpoint 502 berayapti. Bu backend ba'zida ishlayapti, ba'zida yo'q degani.

---

## ✅ Tezkor Yechimlar

### 1-QADAM: Railway Dashboard'da Logs'ni Ko'rish

1. Railway dashboard'ga kiring: https://railway.app
2. Project'ingizni tanlang
3. **"Logs"** yoki **"Deployments"** bo'limiga kiring
4. Eng so'nggi deployment'ning logs'ini ko'ring

**Qidirish kerak bo'lgan xatolar:**

- `MongoDB connection error`
- `JWT_SECRET is not defined`
- `Cannot find module`
- `Application crashed`

---

### 2-QADAM: Environment Variables Tekshirish

Railway dashboard → **Variables** bo'limiga kiring va quyidagilar borligini tekshiring:

✅ **MONGODB_URI** - to'liq connection string
✅ **JWT_SECRET** - kamida 32 belgi
✅ **PORT** - 3000

**MONGODB_URI Format:**

```
mongodb+srv://a6510206a_db_user:YNrFrYsiZC90enyb@cluster0.nywxugn.mongodb.net/smart-quiz?appName=Cluster0
```

**Muhim:**

- Password to'g'ri bo'lishi kerak
- Database nomi (`/smart-quiz`) bo'lishi kerak
- Barcha belgilar to'g'ri bo'lishi kerak

---

### 3-QADAM: MongoDB Connection Tekshirish

MongoDB Atlas dashboard'ga kiring va tekshiring:

1. **Network Access:**

   - `0.0.0.0/0` yoki "Allow Access from Anywhere" bo'lishi kerak
   - Railway IP'lariga ruxsat bo'lishi kerak

2. **Database Access:**
   - Username: `a6510206a_db_user`
   - Password: `YNrFrYsiZC90enyb` to'g'ri bo'lishi kerak

---

### 4-QADAM: Redeploy Qilish

1. Railway dashboard → **Deployments**
2. Eng so'nggi deployment'ni toping
3. **"Redeploy"** tugmasini bosing
4. 2-3 daqiqa kutib turing

Yoki GitHub'ga yangi commit push qiling:

```bash
git commit --allow-empty -m "Fix: Trigger redeploy"
git push
```

---

### 5-QADAM: Server Logs'ni Ko'rish

Railway dashboard → **Logs** bo'limida quyidagilarni qidiring:

**Ijobiy loglar:**

```
✅ Connected to MongoDB
🚀 Server is running on port 3000
```

**Salbiy loglar:**

```
❌ MongoDB connection error: ...
Error: ...
```

---

## 🐛 Eng Keng Tarqalgan Muammolar

### Muammo 1: MongoDB Connection Timeout

**Xato:**

```
MongoDB connection error: connection timeout
```

**Yechim:**

1. MongoDB Atlas → Network Access
2. "Allow Access from Anywhere" (`0.0.0.0/0`) qo'shing
3. 2-3 daqiqa kutib turing
4. Redeploy qiling

---

### Muammo 2: JWT_SECRET Not Defined

**Xato:**

```
JWT_SECRET is not defined
```

**Yechim:**

1. Railway Variables'ga `JWT_SECRET` qo'shing
2. Kamida 32 belgi bo'lishi kerak
3. Redeploy qiling

---

### Muammo 3: Application Crashed

**Xato:**

```
Application crashed
```

**Yechim:**

1. Logs'ni ko'ring va xatolarni toping
2. Environment variables'ni tekshiring
3. package.json da `start` script borligini tekshiring
4. Redeploy qiling

---

### Muammo 4: Intermittent 502 Errors

**Xato:**

- Ba'zida ishlayapti, ba'zida 502 berayapti

**Yechim:**

1. Railway free tier'da server uyquga ketishi mumkin
2. Birinchi so'rov sekin bo'lishi mumkin (cold start)
3. 2-3 marta qayta urinib ko'ring
4. Agar muammo davom etsa, logs'ni ko'ring

---

## ✅ Tekshirish Ro'yxati

- [ ] Railway dashboard'da logs'ni ko'rdim
- [ ] Environment variables to'g'ri qo'shilgan (MONGODB_URI, JWT_SECRET, PORT)
- [ ] MongoDB Atlas'da Network Access sozlandi
- [ ] MongoDB connection string to'g'ri
- [ ] Redeploy qildim
- [ ] 2-3 daqiqa kutdim
- [ ] Qayta urinib ko'rdim

---

## 🔍 Qo'shimcha Tekshirish

### Health Check Endpoint

```
GET https://quiz-app-backend-production-cd1c.up.railway.app/health
```

Agar bu ishlasa, lekin categories ishlamasa, muammo route'da yoki MongoDB'da.

### Root Endpoint

```
GET https://quiz-app-backend-production-cd1c.up.railway.app/
```

Bu ham ishlashi kerak.

---

## 📞 Keyingi Qadamlar

Agar hali ham 502 xatosi bo'lsa:

1. Railway dashboard → **Logs** bo'limidagi xatolarni screenshot qilib oling
2. Environment variables'ni tekshiring
3. MongoDB Atlas connection string'ni qayta tekshiring
4. Xatolarni yuboring, men yordam beraman

---

## 💡 Maslahat

Railway free tier'da:

- Server uyquga ketishi mumkin (inactive bo'lganda)
- Birinchi so'rov sekin bo'lishi mumkin (cold start)
- 2-3 marta qayta urinib ko'ring

Agar muammo davom etsa, logs'ni ko'ring va xatolarni yuboring.
