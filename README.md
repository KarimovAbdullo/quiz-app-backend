# Smart Quiz Backend

A complete backend API for the Smart Quiz mobile app built with Node.js, Express.js, MongoDB, and JWT authentication.

## 📋 Features

- User authentication (Register/Login) with JWT
- Category management
- Question management with solved tracking
- Protected routes with JWT middleware
- Password hashing with bcrypt

## 🚀 Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Create a `.env` file in the root directory (already created) and update it with your MongoDB connection string and JWT secret:

   ```
   MONGODB_URI=mongodb://localhost:27017/smart-quiz
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=3000
   ```

3. **Make sure MongoDB is running:**
   - Local MongoDB: Start your local MongoDB service
   - MongoDB Atlas: Use your Atlas connection string in `.env`

## 🏃 Running the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🌱 Seed Database

To populate the database with initial categories and questions:

```bash
npm run seed
```

This will create:

- 6 categories: Movies, Science, Game, Football, MMA, Music
- 5 questions for each category (30 questions total)

**Note:** The seed script will not duplicate existing categories or questions. You can run it multiple times safely.

## 📡 API Endpoints

### Authentication

#### Register User

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "John Doe"
  }
}
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "John Doe"
  }
}
```

#### Get Profile

```
GET /auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nickname": "John Doe",
    "status": "boshlang'ich",
    "mode": "oddiy",
    "correctAnswers": 5,
    "solvedQuestionsCount": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Values:**

- `"boshlang'ich"` - 0-10 correct answers
- `"super"` - 11-50 correct answers
- `"super daxo"` - 51+ correct answers

**Mode Values:**

- `"oddiy"` - regular user
- `"premium"` - premium user

### Categories

#### Get All Categories

```
GET /categories
Authorization: Bearer YOUR_JWT_TOKEN (optional)
```

**Response:**

```json
{
  "success": true,
  "count": 6,
  "categories": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Movies",
      "questionsCount": 5,
      "completedCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Fields:**

- `questionsCount` - Total number of questions in this category
- `completedCount` - Number of questions the user has correctly answered in this category (only shown if token is provided)

### Questions

#### Get Questions by Category

```
GET /questions/:categoryId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "categoryId": "507f1f77bcf86cd799439012",
      "question": "What is 2 + 2?",
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

**Note:** This endpoint only returns questions that the user hasn't solved yet. The `isCorrect` field is excluded from the response for security.

#### Submit Answer

```
POST /questions/answer
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "questionId": "507f1f77bcf86cd799439011",
  "isCorrect": true
}
```

**Note:** `isCorrect` should be `true` if the answer is correct, `false` if incorrect.

**Response:**

```json
{
  "success": true,
  "message": "Question marked as solved",
  "solvedQuestions": ["507f1f77bcf86cd799439011", "..."],
  "correctAnswers": 5,
  "status": "boshlang'ich"
}
```

**Status is automatically updated based on correctAnswers:**

- 0-10 correct answers → `"boshlang'ich"`
- 11-50 correct answers → `"super"`
- 51+ correct answers → `"super daxo"`

## 🔒 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📁 Project Structure

```
smart-quiz-backend/
├── src/
│   ├── models/
│   │   ├── User.js          # User model with solvedQuestions array
│   │   ├── Category.js      # Category model
│   │   └── Question.js      # Question model with options
│   ├── routes/
│   │   ├── auth.js          # Authentication routes (register/login)
│   │   ├── category.js      # Category routes
│   │   └── question.js      # Question routes
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification middleware
│   └── index.js             # Main server file
├── .env                     # Environment variables
├── package.json
└── README.md
```

## 🗄️ Database Models

### User

- `email` (String, unique, required)
- `password` (String, hashed, required)
- `nickname` (String, required)
- `solvedQuestions` (Array of Question IDs) - All questions user has answered
- `correctlySolvedQuestions` (Array of Question IDs) - Only correctly answered questions
- `status` (String, enum: "boshlang'ich", "super", "super daxo", default: "boshlang'ich")
- `mode` (String, enum: "oddiy", "premium", default: "oddiy")
- `correctAnswers` (Number, default: 0)

### Category

- `name` (String, unique, required)

### Question

- `categoryId` (ObjectId, ref to Category, required)
- `question` (String, required)
- `options` (Array of 4 objects, required)
  - `text` (String)
  - `isCorrect` (Boolean) - exactly one must be true

## 🔧 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📝 Notes

- Passwords are automatically hashed using bcrypt
- JWT tokens expire after 7 days
- Solved questions are tracked per user and never returned again
- The `isCorrect` field is excluded from question responses for security
- All routes return JSON responses with `success` and `message` fields

## 🐛 Troubleshooting

1. **MongoDB connection error:**

   - Make sure MongoDB is running
   - Check your `MONGODB_URI` in `.env`

2. **JWT errors:**

   - Make sure `JWT_SECRET` is set in `.env`
   - Check that the token is included in the Authorization header

3. **Port already in use:**
   - Change `PORT` in `.env` or stop the process using port 3000

## 📄 License

ISC
