// ============================================
// routes/authRoutes.js
// ============================================

const express = require('express')
const router  = express.Router()

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe
} = require('../controllers/authController')

// Import protect middleware
const { protect } = require('../middleware/authMiddleware')

// ─────────────────────────────────────────
// PUBLIC ROUTES — No token needed
// ─────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerUser)

// POST /api/auth/login
router.post('/login', loginUser)

// POST /api/auth/logout
router.post('/logout', logoutUser)

// ─────────────────────────────────────────
// PROTECTED ROUTES — Token required
// protect middleware runs before getMe
// If token invalid → 401 returned immediately
// If token valid   → getMe handler runs
// ─────────────────────────────────────────

// GET /api/auth/me
router.get('/me', protect, getMe)

module.exports = router