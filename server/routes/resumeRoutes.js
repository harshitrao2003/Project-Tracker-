// ============================================
// routes/resumeRoutes.js
// All resume endpoints — all protected
// ============================================

const express = require('express')
const router  = express.Router()

const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  getResumeStats
} = require('../controllers/resumeController')

const { protect } = require('../middleware/authMiddleware')

// GET /api/resumes/stats — must be before /:id
router.get('/stats', protect, getResumeStats)

// GET /api/resumes/status — alias for listing resumes without a specific id
router.get('/status', protect, getResumes)

// GET  /api/resumes
// POST /api/resumes
router.route('/')
  .get(protect,  getResumes)
  .post(protect, createResume)

// GET    /api/resumes/:id
// PUT    /api/resumes/:id
// DELETE /api/resumes/:id
router.route('/:id')
  .get(protect,    getResumeById)
  .put(protect,    updateResume)
  .delete(protect, deleteResume)

module.exports = router