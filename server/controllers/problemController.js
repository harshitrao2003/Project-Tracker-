// ============================================
// controllers/problemController.js
// Handles all problem CRUD operations
// ============================================

const Problem  = require('../models/Problem')
const User     = require('../models/User')
const mongoose = require('mongoose')

// ============================================
// @desc    Get all problems for logged in user
// @route   GET /api/problems
// @access  Private
// ============================================
const getProblems = async (req, res) => {
  try {
    const {
      topic,
      difficulty,
      platform,
      solved,
      search,
      page  = 1,
      limit = 50
    } = req.query

    const filter = { userId: req.user._id }

    if (topic)      filter.topic      = topic
    if (difficulty) filter.difficulty = difficulty
    if (platform)   filter.platform   = platform

    if (solved !== undefined && solved !== '') {
      filter.solved = solved === 'true'
    }

    if (search) {
      filter.title = {
        $regex:   search,
        $options: 'i'
      }
    }

    const pageNum  = parseInt(page)
    const limitNum = parseInt(limit)
    const skip     = (pageNum - 1) * limitNum

    const [problems, total] = await Promise.all([
      Problem
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Problem.countDocuments(filter)
    ])

    res.status(200).json({
      success:  true,
      count:    problems.length,
      total,
      page:     pageNum,
      pages:    Math.ceil(total / limitNum),
      problems
    })

  } catch (error) {
    console.error('Get Problems Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching problems'
    })
  }
}

// ============================================
// @desc    Get single problem by ID
// @route   GET /api/problems/:id
// @access  Private
// ============================================
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    res.status(200).json({
      success: true,
      problem
    })

  } catch (error) {
    console.error('Get Problem Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching problem'
    })
  }
}

// ============================================
// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private
// ============================================
const createProblem = async (req, res) => {
  try {
    const {
      title,
      topic,
      difficulty,
      platform,
      problemUrl,
      notes,
      solved
    } = req.body

    if (!title || !topic || !difficulty || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, topic, difficulty and platform'
      })
    }

    const problem = await Problem.create({
      title,
      topic,
      difficulty,
      platform,
      problemUrl: problemUrl || '',
      notes:      notes      || '',
      solved:     solved     || false,
      userId:     req.user._id
    })

    // ─────────────────────────────────────────
    // UPDATE STREAK if problem is solved
    // Uses the updateStreak() instance method
    // defined on the User model (Step 25)
    // ─────────────────────────────────────────
    if (solved) {
      const user = await User.findById(req.user._id)
      if (user) {
        await user.updateStreak()
      }
    }

    res.status(201).json({
      success: true,
      message: 'Problem added successfully',
      problem
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Create Problem Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating problem'
    })
  }
}

// ============================================
// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private
// ============================================
const updateProblem = async (req, res) => {
  try {
    let problem = await Problem.findOne({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    const wasSolved = problem.solved

    const {
      title,
      topic,
      difficulty,
      platform,
      problemUrl,
      notes,
      solved,
      revisionCount
    } = req.body

    if (title         !== undefined) problem.title         = title
    if (topic         !== undefined) problem.topic         = topic
    if (difficulty    !== undefined) problem.difficulty    = difficulty
    if (platform      !== undefined) problem.platform      = platform
    if (problemUrl    !== undefined) problem.problemUrl    = problemUrl
    if (notes         !== undefined) problem.notes         = notes
    if (solved        !== undefined) problem.solved        = solved
    if (revisionCount !== undefined) problem.revisionCount = revisionCount

    await problem.save()

    // ─────────────────────────────────────────
    // UPDATE STREAK if problem just got marked solved
    // Only fires when going from unsolved → solved
    // ─────────────────────────────────────────
    if (!wasSolved && problem.solved) {
      const user = await User.findById(req.user._id)
      if (user) {
        await user.updateStreak()
      }
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    console.error('Update Problem Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating problem'
    })
  }
}

// ============================================
// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private
// ============================================
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    })

  } catch (error) {
    console.error('Delete Problem Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting problem'
    })
  }
}

// ============================================
// @desc    Get problem stats for dashboard
// @route   GET /api/problems/stats
// @access  Private
// ============================================
const getProblemStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Run all queries in parallel for speed
    const [
      difficultyStats,
      topicStats,
      weeklyStats,
      platformStats,
      user
    ] = await Promise.all([

      // Difficulty breakdown
      Problem.getStatsByUser(userId),

      // Topic wise stats
      Problem.getTopicStats(userId),

      // Weekly stats — last 7 days
      Problem.getWeeklyStats(userId),

      // Platform breakdown
      Problem.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $group: {
            _id:    '$platform',
            total:  { $sum: 1 },
            solved: {
              $sum: { $cond: ['$solved', 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } }
      ]),

      // ─────────────────────────────────────────
      // User streak data — also validates streak
      // hasn't expired using checkStreakValidity()
      // from the User model (Step 25)
      // ─────────────────────────────────────────
      (async () => {
        const u = await User.findById(userId).select(
          'currentStreak longestStreak lastSolvedDate'
        )
        if (u) {
          await u.checkStreakValidity()
        }
        return u
      })()
    ])

    // ─────────────────────────────────────────
    // FORMAT WEEKLY DATA
    // Fill missing days with 0
    // Always returns exactly 7 days
    // ─────────────────────────────────────────
    const last7Days = []
for (let i = 6; i >= 0; i--) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - i)
  date.setUTCHours(0, 0, 0, 0)

  const dateStr = date.toISOString().split('T')[0]
  const found   = weeklyStats.find(w => w.date === dateStr)

  last7Days.push({
    date:  dateStr,
    day:   date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    count: found ? found.count : 0
  })
}

    // Format platform stats
    const formattedPlatforms = platformStats.map(p => ({
      platform: p._id,
      total:    p.total,
      solved:   p.solved
    }))

    // Total problems including unsolved
    const totalInDb = await Problem.countDocuments({ userId })

    res.status(200).json({
      success: true,
      stats: {
        totalSolved:    difficultyStats.total,
        totalProblems:  totalInDb,
        easy:           difficultyStats.Easy,
        medium:         difficultyStats.Medium,
        hard:           difficultyStats.Hard,
        topicStats,
        weeklyStats:    last7Days,
        platformStats:  formattedPlatforms,
        currentStreak:  user?.currentStreak  || 0,
        longestStreak:  user?.longestStreak  || 0,
        lastSolvedDate: user?.lastSolvedDate || null
      }
    })

  } catch (error) {
    console.error('Get Stats Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    })
  }
}

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemStats
}