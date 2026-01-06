# Smart Quiz Backend - O'zbek Tilida Qo'llanma

## 📋 Backendni Ishga Tushirish (Qadam-baqadam)

### 1-QADAM: MongoDB ni O'rnatish va Ishga Tushirish

**Variant A: MongoDB Atlas (Tavsiya etiladi - Bepul)**

1. https://www.mongodb.com/cloud/atlas saytiga kiring
2. Ro'yxatdan o'ting (bepul)
3. Yangi cluster yarating (FREE tier tanlang)
4. Database Access bo'limida foydalanuvchi yarating
5. Network Access bo'limida IP manzil qo'shing (0.0.0.0/0 - hamma joydan ruxsat)
6. Connect qismida "Connect your application" ni tanlang
7. Connection string ni oling (masalan: `mongodb+srv://username:password@cluster.mongodb.net/smart-quiz`)

**Variant B: Lokal MongoDB**

1. MongoDB ni kompyuteringizga o'rnating: https://www.mongodb.com/try/download/community
2. MongoDB ni ishga tushiring
3. Connection string: `mongodb://localhost:27017/smart-quiz`

### 2-QADAM: .env Fayl Yaratish

Loyiha ildizida `.env` nomli fayl yarating va quyidagilarni yozing:

```
MONGODB_URI=mongodb://localhost:27017/smart-quiz
JWT_SECRET=mening-super-maxfiy-kalit-12345
PORT=3000
```

**Muhim:**

- Agar MongoDB Atlas ishlatayotgan bo'lsangiz, `MONGODB_URI` ga Atlas connection string ni yozing
- `JWT_SECRET` ni o'zgartiring (xavfsizlik uchun)

### 3-QADAM: Paketlarni O'rnatish

Terminalda loyiha papkasiga kiring va quyidagi buyruqni bajaring:

```bash
npm install
```

### 4-QADAM: Serverni Ishga Tushirish

```bash
npm start
```

Agar hamma narsa to'g'ri bo'lsa, quyidagi xabarni ko'rasiz:

```
✅ Connected to MongoDB
🚀 Server is running on port 3000
📍 API available at http://localhost:3000
```

---

## 📱 React Native Ilovangiz Uchun API URL'lar

### Base URL

**Development (Emulator/Simulator uchun):**

```
http://localhost:3000
```

**Real Device (Telefon) uchun:**

- Windows: `http://192.168.1.X:3000` (IP manzilingizni toping: `ipconfig`)
- Mac/Linux: `http://192.168.1.X:3000` (IP manzilingizni toping: `ifconfig`)

**Yoki ngrok ishlatib public URL olishingiz mumkin:**

```bash
ngrok http 3000
```

---

## 🔐 Authentication API'lar

### 1. Ro'yxatdan O'tish (Register)

**URL:** `POST http://localhost:3000/auth/register`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "Foydalanuvchi Ismi"
}
```

**React Native Misol:**

```javascript
const register = async (email, password, nickname) => {
  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        nickname: nickname,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Token ni saqlash (AsyncStorage yoki Context)
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "Foydalanuvchi Ismi"
  }
}
```

---

### 2. Kirish (Login)

**URL:** `POST http://localhost:3000/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**React Native Misol:**

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Token ni saqlash
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "Foydalanuvchi Ismi"
  }
}
```

---

### 3. Profilni Olish (Get Profile)

**URL:** `GET http://localhost:3000/auth/profile`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**React Native Misol:**

```javascript
const getProfile = async () => {
  try {
    // Token ni olish
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("http://localhost:3000/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, profile: data.profile };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "Foydalanuvchi Ismi",
    "status": "boshlang'ich",
    "mode": "oddiy",
    "correctAnswers": 5,
    "solvedQuestionsCount": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Qiymatlari:**

- `"boshlang'ich"` - 0-10 to'g'ri javob
- `"super"` - 11-50 to'g'ri javob
- `"super daxo"` - 51+ to'g'ri javob

**Mode Qiymatlari:**

- `"oddiy"` - oddiy foydalanuvchi
- `"premium"` - premium foydalanuvchi

---

## 📂 Categories API

### 3. Barcha Kategoriyalarni Olish

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**React Native Misol:**

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Token ni saqlash
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "Foydalanuvchi Ismi"
  }
}
```

---

## 📂 Categories API

### 3. Barcha Kategoriyalarni Olish

**URL:** `GET http://localhost:3000/categories`

**Headers:** Token kerak emas (Public endpoint)

**React Native Misol:**

```javascript
const getCategories = async () => {
  try {
    const response = await fetch("http://localhost:3000/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, categories: data.categories };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "count": 3,
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Matematika",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Tarix",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## ❓ Questions API

### 4. Kategoriya Bo'yicha Savollarni Olish

**URL:** `GET http://localhost:3000/questions/:categoryId`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Misol:** `GET http://localhost:3000/questions/507f1f77bcf86cd799439011`

**React Native Misol:**

```javascript
const getQuestions = async (categoryId) => {
  try {
    // Token ni olish
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/questions/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Token ni header ga qo'shish
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true, questions: data.questions };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "count": 5,
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "categoryId": "507f1f77bcf86cd799439012",
      "question": "2 + 2 necha?",
      "options": [
        { "text": "3" },
        { "text": "4" },
        { "text": "5" },
        { "text": "6" }
      ]
    }
  ]
}
```

**Muhim:** Bu endpoint faqat foydalanuvchi hal qilmagan savollarni qaytaradi!

---

### 5. Javobni Yuborish (Savolni Hal Qilindi Deb Belgilash)

**URL:** `POST http://localhost:3000/questions/answer`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**

```json
{
  "questionId": "507f1f77bcf86cd799439011",
  "isCorrect": true
}
```

**Muhim:** `isCorrect` - to'g'ri javob bo'lsa `true`, noto'g'ri bo'lsa `false` yuboring.

**React Native Misol:**

```javascript
const submitAnswer = async (questionId, isCorrect) => {
  try {
    // Token ni olish
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("http://localhost:3000/questions/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        questionId: questionId,
        isCorrect: isCorrect, // true yoki false
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.message,
        correctAnswers: data.correctAnswers,
        status: data.status,
      };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Javob (Response):**

```json
{
  "success": true,
  "message": "Question marked as solved",
  "solvedQuestions": ["507f1f77bcf86cd799439011", "..."],
  "correctAnswers": 5,
  "status": "boshlang'ich"
}
```

**Status Avtomatik Yangilanadi:**

- 0-10 to'g'ri javob → `"boshlang'ich"`
- 11-50 to'g'ri javob → `"super"`
- 51+ to'g'ri javob → `"super daxo"`

---

## 🔑 Token Bilan Ishlash

### Token ni Saqlash (Login/Register dan keyin):

```javascript
await AsyncStorage.setItem("token", data.token);
```

### Token ni Olish (Har bir so'rovda):

```javascript
const token = await AsyncStorage.getItem("token");
```

### Token ni Header ga Qo'shish:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
}
```

---

## 📝 To'liq React Native Misol (API Service)

`api.js` fayl yarating:

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://localhost:3000"; // Yoki real device uchun IP manzil

// Token ni olish
const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// Register
export const register = async (email, password, nickname) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, nickname }),
    });
    const data = await response.json();
    if (data.success) {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get Categories
export const getCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get Profile
export const getProfile = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get Questions by Category
export const getQuestions = async (categoryId) => {
  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/questions/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Submit Answer
export const submitAnswer = async (questionId, isCorrect) => {
  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/questions/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionId, isCorrect }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

---

## ⚠️ Muhim Eslatmalar

1. **Real Device (Telefon) uchun:**

   - `localhost` ishlamaydi!
   - Kompyuteringizning IP manzilini ishlating
   - Yoki ngrok ishlatib public URL oling

2. **Token Xavfsizligi:**

   - Token ni har doim header ga qo'shing
   - Token ni xavfsiz saqlang (AsyncStorage)

3. **Error Handling:**

   - Har bir so'rovda `data.success` ni tekshiring
   - Xatoliklarni foydalanuvchiga ko'rsating

4. **Network Security:**
   - Android uchun `AndroidManifest.xml` ga internet ruxsati qo'shing
   - iOS uchun `Info.plist` ga App Transport Security sozlamalari qo'shing

---

## 🐛 Muammolar va Yechimlar

**Muammo:** "Network request failed"

- **Yechim:** IP manzilni to'g'ri kiriting yoki ngrok ishlating

**Muammo:** "401 Unauthorized"

- **Yechim:** Token ni to'g'ri yuborilganligini tekshiring

**Muammo:** "MongoDB connection error"

- **Yechim:** MongoDB ni ishga tushiring yoki Atlas connection string ni tekshiring

---

## ✅ Tekshirish

Backend ishlayotganini tekshirish uchun brauzerda oching:

```
http://localhost:3000
```

Agar quyidagi javobni ko'rsangiz, hamma narsa to'g'ri:

```json
{
  "success": true,
  "message": "Smart Quiz Backend API is running!",
  "endpoints": { ... }
}
```
