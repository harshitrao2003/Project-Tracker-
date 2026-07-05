// ============================================
// routes/interviewRoutes.js
// All interview endpoints — all protected
// ============================================

const express = require('express')
const router  = express.Router()

const {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewAnalytics
} = require('../controllers/interviewController')

const { protect } = require('../middleware/authMiddleware')

// GET /api/interviews/analytics — must be before /:id
router.get('/analytics', protect, getInterviewAnalytics)

// GET  /api/interviews
// POST /api/interviews
router.route('/')
  .get(protect,  getInterviews)
  .post(protect, createInterview)

// GET    /api/interviews/:id
// PUT    /api/interviews/:id
// DELETE /api/interviews/:id
router.route('/:id')
  .get(protect,    getInterviewById)
  .put(protect,    updateInterview)
  .delete(protect, deleteInterview)

module.exports = router