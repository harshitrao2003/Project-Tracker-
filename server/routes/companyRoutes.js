// ============================================
// routes/companyRoutes.js
// All company endpoints — all protected
// ============================================

const express = require('express')
const router  = express.Router()

const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
  getCompanyStats
} = require('../controllers/companyController')

const { protect } = require('../middleware/authMiddleware')

// GET /api/companies/stats — must be before /:id
router.get('/stats', protect, getCompanyStats)

// GET  /api/companies
// POST /api/companies
router.route('/')
  .get(protect,  getCompanies)
  .post(protect, createCompany)

// PATCH /api/companies/:id/status — quick status update
router.patch('/:id/status', protect, updateCompanyStatus)

// GET    /api/companies/:id
// PUT    /api/companies/:id
// DELETE /api/companies/:id
router.route('/:id')
  .get(protect,    getCompanyById)
  .put(protect,    updateCompany)
  .delete(protect, deleteCompany)

module.exports = router