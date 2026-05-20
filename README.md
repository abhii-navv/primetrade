# Task Manager API — Backend Intern Assignment

A full-stack application with a secure REST API (JWT Auth + RBAC) and a React frontend.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | PostgreSQL                          |
| Auth       | JWT + bcryptjs                      |
| Validation | express-validator                   |
| Docs       | Swagger UI (OpenAPI 3.0)            |
| Frontend   | React 18, React Router v6, Axios    |
| Bundler    | Vite                                |

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/db.js           # PostgreSQL connection
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── roleCheck.js       # Role-based guard
│   │   ├── models/
│   │   │   ├── User.js            # User DB queries
│   │   │   └── Task.js            # Task DB queries
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register/Login logic
│   │   │   └── taskController.js  # CRUD logic
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/v1/auth/*
│   │   │   └── taskRoutes.js      # /api/v1/tasks/*
│   │   └── swagger.js             # Swagger config
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── api.js                  # Axios instance + interceptors
    │   └── App.jsx
    └── package.json
```

---

## Setup & Run

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

Server runs on `http://localhost:5000`  
Swagger docs: `http://localhost:5000/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

---

## API Endpoints

### Auth  `/api/v1/auth`

| Method | Endpoint    | Access     | Description         |
|--------|-------------|------------|---------------------|
| POST   | /register   | Public     | Register new user   |
| POST   | /login      | Public     | Login, get JWT      |
| GET    | /me         | User/Admin | Get own profile     |
| GET    | /users      | Admin only | List all users      |

### Tasks  `/api/v1/tasks`

| Method | Endpoint  | Access     | Description                          |
|--------|-----------|------------|--------------------------------------|
| GET    | /         | User/Admin | Own tasks (admin sees all)           |
| GET    | /:id      | User/Admin | Get task by ID                       |
| POST   | /         | User/Admin | Create task                          |
| PUT    | /:id      | User/Admin | Update task (own or admin)           |
| DELETE | /:id      | User/Admin | Delete task (own or admin)           |

---

## Security Practices

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT signed with secret, expires in 7 days
- Input validated and sanitized with express-validator
- Role checked on every protected route
- Tokens automatically cleared on 401 response

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Tables are auto-created on server start.
