// ============================================
// server.js — Entry Point of the Backend
// ============================================

const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const cors    = require('cors')

const connectDB      = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

// Connect to MongoDB
connectDB()

// ============================================
// MIDDLEWARE
// ============================================
// ❌ Current — missing PATCH
app.use(cors({
  origin:         process.env.CLIENT_URL || 'http://localhost:5173',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'Placement Tracker API is running',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString()
  })
})

// ============================================
// ROUTES
// ============================================
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/problems',    require('./routes/problemRoutes'))
app.use('/api/companies',   require('./routes/companyRoutes'))
app.use('/api/resumes',     require('./routes/resumeRoutes'))
app.use('/api/interviews',  require('./routes/interviewRoutes'))
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'))

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound)
app.use(errorHandler)

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`
  ================================
  🚀 Server running in ${process.env.NODE_ENV} mode
  🌐 URL: http://localhost:${PORT}
  ✅ Health: http://localhost:${PORT}/api/health
  ================================
  `)
})