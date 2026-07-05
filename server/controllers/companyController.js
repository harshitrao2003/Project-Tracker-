// ============================================
// controllers/companyController.js
// Handles all company application CRUD operations
// ============================================

const Company = require('../models/Company')
const mongoose = require('mongoose')

// ============================================
// @desc    Get all companies for logged in user
// @route   GET /api/companies
// @access  Private
// ============================================
const getCompanies = async (req, res) => {
  try {
    const {
      status,
      search,
      sortBy = 'appliedDate',
      order  = 'desc'
    } = req.query

    // Build filter
    const filter = { userId: req.user._id }

    if (status) filter.status = status

    // Search by company name or role
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { role:        { $regex: search, $options: 'i' } }
      ]
    }

    // Sort direction
    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj   = { [sortBy]: sortOrder }

    const companies = await Company
      .find(filter)
      .sort(sortObj)

    res.status(200).json({
      success: true,
      count:   companies.length,
      companies
    })

  } catch (error) {
    console.error('Get Companies Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching companies'
    })
  }
}

// ============================================
// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Private
// ============================================
const getCompanyById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' })
    }

    const company = await Company.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company application not found'
      })
    }

    res.status(200).json({
      success: true,
      company
    })

  } catch (error) {
    console.error('Get Company Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching company'
    })
  }
}

// ============================================
// @desc    Create a new company application
// @route   POST /api/companies
// @access  Private
// ============================================
const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      role,
      package: packageOffered,
      status,
      appliedDate,
      jobUrl,
      notes
    } = req.body

    if (!companyName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name and role'
      })
    }

    const company = await Company.create({
      companyName,
      role,
      package:     packageOffered || '',
      status:      status         || 'Applied',
      appliedDate: appliedDate    || Date.now(),
      jobUrl:      jobUrl         || '',
      notes:       notes          || '',
      userId:      req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Company application added successfully',
      company
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Create Company Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating company application'
    })
  }
}

// ============================================
// @desc    Update a company application
// @route   PUT /api/companies/:id
// @access  Private
// ============================================
const updateCompany = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' })
    }

    let company = await Company.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company application not found'
      })
    }

    const {
      companyName,
      role,
      package: packageOffered,
      status,
      appliedDate,
      jobUrl,
      notes
    } = req.body

    if (companyName    !== undefined) company.companyName = companyName
    if (role           !== undefined) company.role         = role
    if (packageOffered !== undefined) company.package      = packageOffered
    if (status         !== undefined) company.status       = status
    if (appliedDate    !== undefined) company.appliedDate  = appliedDate
    if (jobUrl         !== undefined) company.jobUrl       = jobUrl
    if (notes          !== undefined) company.notes        = notes

    // pre('save') hook auto-logs status change to statusHistory
    await company.save()

    res.status(200).json({
      success: true,
      message: 'Company application updated successfully',
      company
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Update Company Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating company application'
    })
  }
}

// ============================================
// @desc    Update only status (quick action)
// @route   PATCH /api/companies/:id/status
// @access  Private
// Used by Kanban drag-and-drop in Step 28
// ============================================
const updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' })
    }

    const company = await Company.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company application not found'
      })
    }

    company.status = status
    await company.save()

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      company
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Update Status Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating status'
    })
  }
}

// ============================================
// @desc    Delete a company application
// @route   DELETE /api/companies/:id
// @access  Private
// ============================================
const deleteCompany = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' })
    }

    const company = await Company.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company application not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Company application deleted successfully'
    })

  } catch (error) {
    console.error('Delete Company Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting company application'
    })
  }
}

// ============================================
// @desc    Get pipeline stats — counts per status
// @route   GET /api/companies/stats
// @access  Private
// ============================================
const getCompanyStats = async (req, res) => {
  try {
    const statusCounts = await Company.getStatusCounts(req.user._id)

    res.status(200).json({
      success: true,
      stats: statusCounts
    })

  } catch (error) {
    console.error('Get Company Stats Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching company stats'
    })
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
  getCompanyStats
}