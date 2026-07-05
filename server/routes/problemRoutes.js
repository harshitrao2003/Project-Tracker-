// ============================================
// routes/problemRoutes.js
// All problem endpoints — all protected
// ============================================

const express = require('express')
const router  = express.Router()

const {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemStats
} = require('../controllers/problemController')

const { protect } = require('../middleware/authMiddleware')

// All routes require authentication
// protect middleware runs before every handler

// GET  /api/problems/stats  ← Must be BEFORE /:id
// otherwise Express thinks "stats" is an ID
router.get('/stats', protect, getProblemStats)

// GET  /api/problems
// POST /api/problems
router.route('/')
  .get(protect,  getProblems)
  .post(protect, createProblem)

// GET    /api/problems/:id
// PUT    /api/problems/:id
// DELETE /api/problems/:id
router.route('/:id')
  .get(protect,    getProblemById)
  .put(protect,    updateProblem)
  .delete(protect, deleteProblem)

module.exports = router