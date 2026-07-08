# 🎯 Placement Tracker

A full-stack MERN application to help students track their placement preparation — DSA problems, company applications, resumes, mock interviews, and more.

## 🌐 Live Demo

- **Frontend:** https://project-tracker-five-mu.vercel.app
- **Backend API:** https://project-tracker-api-m9ch.onrender.com
- **Health Check:** https://project-tracker-api-m9ch.onrender.com/api/health

> **Note:** The backend is hosted on Render's free tier and may take 30-60 seconds to wake up after inactivity.

---

## ✨ Features

### 🔐 Authentication
- User Registration and Login
- JWT-based Authentication
- Protected Routes
- Password Hashing with bcryptjs

### 💻 Problem Tracker
- Add, Edit, Delete DSA problems
- Filter by Topic, Difficulty, Platform
- Search by problem title
- Toggle solved/unsolved status
- Track solved date automatically

### 📊 Dashboard & Analytics
- Total problems solved stats
- Easy / Medium / Hard breakdown
- Weekly activity bar chart
- Topic distribution pie chart
- Daily streak tracking (LeetCode-style)
- Activity calendar heatmap
- Topic-wise progress bars

### 🏢 Company Application Tracker
- Kanban-style pipeline board
- 6 status stages: Applied → OA Cleared → Interview → HR Round → Selected → Rejected
- Drag and drop between columns
- Status history timeline

### 📄 Resume Tracker
- Track multiple resume versions
- ATS score tracking with progress bar
- Status: Draft → Ready → Submitted → Updated
- Highlight tags per resume version

### 🎤 Mock Interview Tracker
- Track mock interview sessions
- Score out of 10
- Performance analytics by interview type
- Topics covered tracking
- Next action items

### 🏆 Leaderboard
- Public rankings by problems solved
- Top 3 podium with animations
- Filter by college and branch
- Weighted score (Hard × 3, Medium × 2, Easy × 1)
- Current user highlighted

### 👤 Profile Page
- View and edit personal info
- Professional links (LinkedIn, GitHub, LeetCode, GFG)
- Stats summary
- Graduation year tracking

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshotsdashboard.png)

### Problem Tracker
![Problems](screenshotsproblem.png)

### Company Pipeline
![Companies](screenshotscompany.png)

### Leaderboard
![Leaderboard](screenshotsleaderboard.png)

---

## 🗂️ Folder Structure
placement-tracker/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                 # Axios configuration
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Navbar, Sidebar, Loader
│   │   │   ├── dashboard/       # StatCard, Charts, Streak
│   │   │   ├── problems/        # ProblemForm, ProblemCard
│   │   │   ├── companies/       # CompanyForm, CompanyCard
│   │   │   ├── resumes/         # ResumeForm, ResumeCard
│   │   │   └── interviews/      # InterviewForm, InterviewCard
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # useAuth, useDebounce, useLocalStorage
│   │   ├── pages/               # Page components
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Problems.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── Resumes.jsx
│   │   │   ├── Interviews.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Progress.jsx
│   │   ├── styles/              # CSS files
│   │   └── utils/               # Helper functions
│   ├── .env.production
│   ├── vercel.json
│   └── vite.config.js
│
└── server/                      # Node.js + Express Backend
├── config/
│   └── db.js                # MongoDB connection
├── controllers/             # Business logic
│   ├── authController.js
│   ├── problemController.js
│   ├── companyController.js
│   ├── resumeController.js
│   ├── interviewController.js
│   └── leaderboardController.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── errorMiddleware.js  # Error handling
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Problem.js
│   ├── Company.js
│   ├── Resume.js
│   └── Interview.js
├── routes/                  # Express routes
├── utils/
│   └── generateToken.js
└── server.js

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router DOM | Client-side Routing |
| Axios | HTTP Client |
| Recharts | Charts and Graphs |
| CSS Variables | Theming |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB Atlas | Cloud Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| dotenv | Environment Variables |
| cors | Cross-Origin Requests |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |

---

## 📡 API Documentation

### Authentication

POST   /api/auth/register    Register new user
POST   /api/auth/login       Login user
POST   /api/auth/logout      Logout user
GET    /api/auth/me          Get current user
PUT    /api/auth/profile     Update profile

### Problems
GET    /api/problems         Get all problems (with filters)
GET    /api/problems/stats   Get problem statistics
GET    /api/problems/:id     Get single problem
POST   /api/problems         Create problem
PUT    /api/problems/:id     Update problem
DELETE /api/problems/:id     Delete problem

### Companies
GET    /api/companies        Get all applications
GET    /api/companies/stats  Get pipeline stats
GET    /api/companies/:id    Get single application
POST   /api/companies        Create application
PUT    /api/companies/:id    Update application
PATCH  /api/companies/:id/status  Update status only
DELETE /api/companies/:id    Delete application

### Resumes
GET    /api/resumes          Get all resumes
GET    /api/resumes/stats    Get resume stats
GET    /api/resumes/:id      Get single resume
POST   /api/resumes          Create resume
PUT    /api/resumes/:id      Update resume
DELETE /api/resumes/:id      Delete resume

### Interviews
GET    /api/interviews           Get all interviews
GET    /api/interviews/analytics Get analytics
GET    /api/interviews/:id       Get single interview
POST   /api/interviews           Create interview
PUT    /api/interviews/:id       Update interview
DELETE /api/interviews/:id       Delete interview

### Leaderboard
GET    /api/leaderboard          Get rankings
GET    /api/leaderboard/colleges Get college list
GET    /api/leaderboard/branches Get branch list

---

## 🚀 Installation Guide

### Prerequisites
Node.js >= 18.0.0
npm >= 8.0.0
MongoDB Atlas account
Git

### 1. Clone the Repository
```bash
git clone https://github.com/harshitrao2003/Project-Tracker-.git
cd Project-Tracker-
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placement-tracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

Create `.env` file in `client/`:
```env
VITE_API_URL=/api
```

Start frontend:
```bash
npm run dev
```

### 4. Open in Browser
http://localhost:5173

---

## 🌍 Deployment Guide

### Backend — Render

Push code to GitHub
Create account at render.com
New Web Service → Connect GitHub repo
Root Directory: server
Build Command: npm install
Start Command: npm start
Add environment variables
Deploy


### Frontend — Vercel

Create account at vercel.com
Import GitHub repository
Root Directory: client
Framework: Vite
Add environment variable:
VITE_API_URL=https://your-render-url.onrender.com/api
Deploy


---

## 🧠 What I Learned

### Backend
- Building RESTful APIs with Express.js
- MongoDB schema design with Mongoose
- JWT authentication flow
- Password hashing with bcryptjs
- Mongoose aggregation pipelines
- CORS configuration for production
- Error handling middleware
- Streak tracking algorithm

### Frontend
- React Context API for global state
- Custom hooks (useAuth, useDebounce, useLocalStorage)
- Protected and auth routes with React Router
- Axios interceptors for auto token attachment
- Recharts for data visualization
- HTML5 drag and drop API
- CSS variables for theming
- Debounced search for performance
- Optimistic UI updates

### DevOps
- Deploying Node.js to Render
- Deploying React to Vercel
- MongoDB Atlas cloud setup
- Environment variables management
- GitHub version control workflow

---

## 👨‍💻 Author

**Harshit Rao**
- GitHub: [@harshitrao2003](https://github.com/harshitrao2003)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## ⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub!