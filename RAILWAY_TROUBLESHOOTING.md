# Railway 502 Bad Gateway Xatosini Hal Qilish

## 🔴 Muammo: 502 Bad Gateway

Bu xato backend server ishlamayotganini ko'rsatadi.

---

## ✅ Qadam-baqadam Yechim

### 1-QADAM: Railway Dashboard'da Logs'ni Ko'rish

1. Railway dashboard'ga kiring
2. Project'ingizni tanlang
3. **Deployments** yoki **Logs** bo'limiga kiring
4. Xatolarni ko'ring

**Ko'rinadigan xatolar:**

- `MongoDB connection error` - MongoDB ulanish muammosi
- `JWT_SECRET is not defined` - Environment variable muammosi
- `Cannot find module` - Paket muammosi

---

### 2-QADAM: Environment Variables Tekshirish

Railway dashboard'da **Variables** bo'limiga kiring va quyidagilar borligini tekshiring:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-quiz
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
PORT=3000
```

**Muhim:**

- `MONGODB_URI` - MongoDB Atlas connection string to'g'ri bo'lishi kerak
- `JWT_SECRET` - Kamida 32 belgi bo'lishi kerak
- `PORT` - Railway avtomatik beradi, lekin 3000 qoldirishingiz mumkin

---

### 3-QADAM: MongoDB Atlas Sozlash

1. MongoDB Atlas dashboard'ga kiring
2. **Network Access** bo'limiga kiring
3. **Add IP Address** ni bosing
4. **Allow Access from Anywhere** ni tanlang yoki `0.0.0.0/0` qo'shing
5. **Database Access** bo'limida foydalanuvchi yarating va parol o'rnating
6. Connection string ni oling va Railway Variables'ga qo'shing

**Connection String Format:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-quiz?retryWrites=true&w=majority
```

---

### 4-QADAM: Deploy Qayta Ishga Tushirish

1. Railway dashboard'da project'ingizni tanlang
2. **Deployments** bo'limiga kiring
3. Eng so'nggi deployment'ni toping
4. **Redeploy** yoki **Deploy** tugmasini bosing

Yoki GitHub'ga yangi commit push qiling:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

### 5-QADAM: package.json Tekshirish

`package.json` faylida `start` script borligini tekshiring:

```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

---

### 6-QADAM: Server Port Tekshirish

Railway avtomatik `PORT` environment variable beradi. `src/index.js` faylida quyidagicha bo'lishi kerak:

```javascript
const PORT = process.env.PORT || 3000;
```

Bu to'g'ri sozlangan.

---

## 🐛 Eng Keng Tarqalgan Muammolar

### Muammo 1: MongoDB Connection Error

**Xato:**

```
❌ MongoDB connection error: ...
```

**Yechim:**

1. MongoDB Atlas'da Network Access'da `0.0.0.0/0` qo'shing
2. Connection string ni to'g'ri yozing
3. Username va password to'g'ri bo'lishi kerak

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

### Muammo 3: Module Not Found

**Xato:**

```
Cannot find module 'express'
```

**Yechim:**

1. `package.json` da barcha dependencies borligini tekshiring
2. Railway avtomatik `npm install` qiladi
3. Agar muammo bo'lsa, `package-lock.json` ni GitHub'ga push qiling

---

### Muammo 4: Port Already in Use

**Xato:**

```
Port 3000 is already in use
```

**Yechim:**

1. Railway avtomatik PORT beradi
2. `process.env.PORT` ishlatilganligini tekshiring
3. Hardcoded port ishlatmang

---

## ✅ Tekshirish Ro'yxati

- [ ] Railway dashboard'da logs'ni ko'rdim
- [ ] Environment variables to'g'ri qo'shilgan (MONGODB_URI, JWT_SECRET, PORT)
- [ ] MongoDB Atlas'da Network Access sozlandi (0.0.0.0/0)
- [ ] MongoDB Atlas'da Database Access sozlandi (username/password)
- [ ] Connection string to'g'ri
- [ ] package.json da start script bor
- [ ] Redeploy qildim
- [ ] Health check endpoint ishlayapti

---

## 🔍 Tekshirish

Redeploy qilgandan keyin, 2-3 daqiqa kutib, keyin quyidagilarni tekshiring:

1. **Health Check:**

   ```
   GET https://quiz-app-backend-production-cd1c.up.railway.app/health
   ```

2. **Root Endpoint:**
   ```
   GET https://quiz-app-backend-production-cd1c.up.railway.app/
   ```

Agar hali ham 502 xatosi bo'lsa, Railway dashboard'da logs'ni ko'ring va xatolarni yuboring.

---

## 📞 Qo'shimcha Yordam

Agar muammo hal bo'lmasa:

1. Railway dashboard'da **Logs** bo'limidagi xatolarni ko'ring
2. Xatolarni screenshot qilib oling
3. MongoDB Atlas connection string ni tekshiring
4. Environment variables'ni qayta tekshiring
