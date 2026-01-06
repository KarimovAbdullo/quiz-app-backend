# React Native uchun API URL'lar

## 🚀 Base URL

```
https://quiz-app-backend-production-cd1c.up.railway.app
```

---

## 📱 Barcha API Endpoint'lar

### 1. ✅ Register (Ro'yxatdan O'tish)

**URL:** `POST https://quiz-app-backend-production-cd1c.up.railway.app/auth/register`

**Headers:**

```
Content-Type: application/json
```

**Body:**

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
    const response = await fetch(
      "https://quiz-app-backend-production-cd1c.up.railway.app/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          nickname: nickname,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
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

**Javob:**

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

### 2. ✅ Login (Kirish)

**URL:** `POST https://quiz-app-backend-production-cd1c.up.railway.app/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body:**

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
    const response = await fetch(
      "https://quiz-app-backend-production-cd1c.up.railway.app/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
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

**Javob:**

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

### 3. ✅ Get Categories (Kategoriyalarni Olish)

**URL:** `GET https://quiz-app-backend-production-cd1c.up.railway.app/categories`

**Headers:** Token kerak emas (Public endpoint)

**React Native Misol:**

```javascript
const getCategories = async () => {
  try {
    const response = await fetch(
      "https://quiz-app-backend-production-cd1c.up.railway.app/categories",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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

**Javob:**

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
    }
  ]
}
```

---

### 4. ✅ Get Profile (Profilni Olish)

**URL:** `GET https://quiz-app-backend-production-cd1c.up.railway.app/auth/profile`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**React Native Misol:**

```javascript
const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      "https://quiz-app-backend-production-cd1c.up.railway.app/auth/profile",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

**Javob:**

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

---

## 📝 To'liq API Service Fayl

`api.js` fayl yarating:

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://quiz-app-backend-production-cd1c.up.railway.app";

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

## ✅ Tekshirish

Backend ishlayotganini tekshirish uchun brauzerda yoki Postman'da oching:

```
GET https://quiz-app-backend-production-cd1c.up.railway.app/health
```

Yoki:

```
GET https://quiz-app-backend-production-cd1c.up.railway.app/
```

Agar quyidagi javobni ko'rsangiz, hamma narsa to'g'ri ishlayapti:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ⚠️ Muhim Eslatmalar

1. **HTTPS:** Railway avtomatik HTTPS beradi, shuning uchun `https://` ishlating
2. **Token:** Login/Register dan keyin token ni saqlang va har bir protected route'da yuboring
3. **CORS:** Backend'da CORS yoqilgan, shuning uchun React Native'dan so'rovlar ishlaydi
4. **Error Handling:** Har bir so'rovda `data.success` ni tekshiring

---

## 🐛 Muammolar

Agar so'rovlar ishlamasa:

1. **Network Error:** Internet aloqasini tekshiring
2. **401 Unauthorized:** Token ni to'g'ri yuborilganligini tekshiring
3. **500 Error:** Railway dashboard'da logs'ni ko'ring
4. **CORS Error:** Backend'da CORS allaqachon yoqilgan, lekin agar muammo bo'lsa, Railway Settings'ni tekshiring
