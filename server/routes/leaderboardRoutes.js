// ============================================
// routes/leaderboardRoutes.js
// Public leaderboard endpoints
// No authentication required
// ============================================

const express = require('express')
const router  = express.Router()

const {
  getLeaderboard,
  getColleges,
  getBranches
} = require('../controllers/leaderboardController')

// GET /api/leaderboard
router.get('/', getLeaderboard)

// GET /api/leaderboard/colleges
router.get('/colleges', getColleges)

// GET /api/leaderboard/branches
router.get('/branches', getBranches)

module.exports = router