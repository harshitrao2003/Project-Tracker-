// ============================================
// controllers/resumeController.js
// Handles all resume CRUD operations
// ============================================

const mongoose = require('mongoose')
const Resume = require('../models/Resume')

const isValidObjectId = (value) => {
  return Boolean(value && mongoose.Types.ObjectId.isValid(value))
}

// ============================================
// @desc    Get all resumes for logged in user
// @route   GET /api/resumes
// @access  Private
// ============================================
const getResumes = async (req, res) => {
  try {
    const {
      status,
      search,
      sortBy = 'createdAt',
      order  = 'desc'
    } = req.query

    const filter = { userId: req.user._id }

    if (status) filter.status = status

    if (search) {
      filter.$or = [
        { title:         { $regex: search, $options: 'i' } },
        { targetCompany: { $regex: search, $options: 'i' } }
      ]
    }

    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj   = { [sortBy]: sortOrder }

    const resumes = await Resume
      .find(filter)
      .sort(sortObj)

    res.status(200).json({
      success: true,
      count:   resumes.length,
      resumes
    })

  } catch (error) {
    console.error('Get Resumes Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching resumes'
    })
  }
}

// ============================================
// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
// ============================================
const getResumeById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      })
    }

    const resume = await Resume.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      })
    }

    res.status(200).json({
      success: true,
      resume
    })

  } catch (error) {
    console.error('Get Resume Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching resume'
    })
  }
}

// ============================================
// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
// ============================================
const createResume = async (req, res) => {
  try {
    const {
      title,
      targetCompany,
      resumeLink,
      version,
      status,
      highlights,
      notes,
      atsScore
    } = req.body

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Resume title is required'
      })
    }

    const resume = await Resume.create({
      title,
      targetCompany: targetCompany || 'General',
      resumeLink:    resumeLink    || '',
      version:       version       || 'v1',
      status:        status        || 'Draft',
      highlights:    highlights    || [],
      notes:         notes         || '',
      atsScore:      atsScore      || null,
      userId:        req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Resume added successfully',
      resume
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Create Resume Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating resume'
    })
  }
}

// ============================================
// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
// ============================================
const updateResume = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      })
    }

    const resume = await Resume.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      })
    }

    const {
      title,
      targetCompany,
      resumeLink,
      version,
      status,
      highlights,
      notes,
      atsScore
    } = req.body

    if (title         !== undefined) resume.title         = title
    if (targetCompany !== undefined) resume.targetCompany = targetCompany
    if (resumeLink    !== undefined) resume.resumeLink    = resumeLink
    if (version       !== undefined) resume.version       = version
    if (status        !== undefined) resume.status        = status
    if (highlights    !== undefined) resume.highlights    = highlights
    if (notes         !== undefined) resume.notes         = notes
    if (atsScore      !== undefined) resume.atsScore      = atsScore

    await resume.save()

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      resume
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Update Resume Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating resume'
    })
  }
}

// ============================================
// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
// ============================================
const deleteResume = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      })
    }

    const resume = await Resume.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    })

  } catch (error) {
    console.error('Delete Resume Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting resume'
    })
  }
}

// ============================================
// @desc    Get resume stats
// @route   GET /api/resumes/stats
// @access  Private
// ============================================
const getResumeStats = async (req, res) => {
  try {
    const statusCounts = await Resume.getStatusCounts(req.user._id)

    res.status(200).json({
      success: true,
      stats:   statusCounts
    })

  } catch (error) {
    console.error('Get Resume Stats Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching resume stats'
    })
  }
}

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  getResumeStats
}