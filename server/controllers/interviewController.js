// ============================================
// controllers/interviewController.js
// Handles all mock interview CRUD operations
// ============================================

const mongoose = require('mongoose')
const Interview = require('../models/Interview')

// ============================================
// @desc    Get all interviews for logged in user
// @route   GET /api/interviews
// @access  Private
// ============================================
const getInterviews = async (req, res) => {
  try {
    const {
      interviewType,
      result,
      search,
      sortBy = 'date',
      order  = 'desc'
    } = req.query

    const filter = { userId: req.user._id }

    if (interviewType) filter.interviewType = interviewType
    if (result)        filter.result        = result

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { feedback:    { $regex: search, $options: 'i' } }
      ]
    }

    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj   = { [sortBy]: sortOrder }

    const interviews = await Interview
      .find(filter)
      .sort(sortObj)

    res.status(200).json({
      success:    true,
      count:      interviews.length,
      interviews
    })

  } catch (error) {
    console.error('Get Interviews Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching interviews'
    })
  }
}

// ============================================
// @desc    Get single interview by ID
// @route   GET /api/interviews/:id
// @access  Private
// ============================================
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      })
    }

    res.status(200).json({
      success: true,
      interview
    })

  } catch (error) {
    console.error('Get Interview Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching interview'
    })
  }
}

// ============================================
// @desc    Create a new interview record
// @route   POST /api/interviews
// @access  Private
// ============================================
const createInterview = async (req, res) => {
  try {
    const {
      companyName,
      interviewType,
      date,
      score,
      result,
      duration,
      feedback,
      topicsCovered,
      nextAction,
      difficulty
    } = req.body

    if (!companyName || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Company name and interview type are required'
      })
    }

    const interview = await Interview.create({
      companyName,
      interviewType,
      date:          date          || Date.now(),
      score:         score         ?? null,
      result:        result        || 'Pending',
      duration:      duration      || 60,
      feedback:      feedback      || '',
      topicsCovered: topicsCovered || [],
      nextAction:    nextAction    || '',
      difficulty:    difficulty    || 'Medium',
      userId:        req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Interview record added successfully',
      interview
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Create Interview Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating interview record'
    })
  }
}

// ============================================
// @desc    Update an interview record
// @route   PUT /api/interviews/:id
// @access  Private
// ============================================
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      })
    }

    const {
      companyName,
      interviewType,
      date,
      score,
      result,
      duration,
      feedback,
      topicsCovered,
      nextAction,
      difficulty
    } = req.body

    if (companyName    !== undefined) interview.companyName    = companyName
    if (interviewType  !== undefined) interview.interviewType  = interviewType
    if (date           !== undefined) interview.date           = date
    if (score          !== undefined) interview.score          = score
    if (result         !== undefined) interview.result         = result
    if (duration       !== undefined) interview.duration       = duration
    if (feedback       !== undefined) interview.feedback       = feedback
    if (topicsCovered  !== undefined) interview.topicsCovered  = topicsCovered
    if (nextAction     !== undefined) interview.nextAction     = nextAction
    if (difficulty     !== undefined) interview.difficulty     = difficulty

    await interview.save()

    res.status(200).json({
      success: true,
      message: 'Interview record updated successfully',
      interview
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Update Interview Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating interview record'
    })
  }
}

// ============================================
// @desc    Delete an interview record
// @route   DELETE /api/interviews/:id
// @access  Private
// ============================================
const deleteInterview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID'
      })
    }

    const interview = await Interview.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Interview record deleted successfully'
    })

  } catch (error) {
    console.error('Delete Interview Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting interview record'
    })
  }
}

// ============================================
// @desc    Get interview analytics
// @route   GET /api/interviews/analytics
// @access  Private
// ============================================
const getInterviewAnalytics = async (req, res) => {
  try {
    const analytics = await Interview.getAnalytics(req.user._id)

    res.status(200).json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Get Interview Analytics Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching interview analytics'
    })
  }
}

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewAnalytics
}