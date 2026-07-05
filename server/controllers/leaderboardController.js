// ============================================
// controllers/leaderboardController.js
// Public leaderboard — ranks users by
// problems solved with college/branch filters
// ============================================

const User    = require('../models/User')
const Problem = require('../models/Problem')
const mongoose = require('mongoose')

// ============================================
// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
// ============================================
const getLeaderboard = async (req, res) => {
  try {
    const {
      college,
      branch,
      limit = 50
    } = req.query

    // ─────────────────────────────────────────
    // STEP 1 — Build user filter
    // ─────────────────────────────────────────
    const userFilter = {}

    if (college) {
      userFilter.college = { $regex: college, $options: 'i' }
    }

    if (branch) {
      userFilter.branch = { $regex: branch, $options: 'i' }
    }

    // ─────────────────────────────────────────
    // STEP 2 — Get all matching users
    // ─────────────────────────────────────────
    const users = await User.find(userFilter).select(
      'name college branch graduationYear currentStreak longestStreak'
    )

    if (users.length === 0) {
      return res.status(200).json({
        success:     true,
        count:       0,
        leaderboard: []
      })
    }

    // ─────────────────────────────────────────
    // STEP 3 — Get solved problem counts
    // for each user using aggregation
    // ─────────────────────────────────────────
    const userIds = users.map(u => u._id)

    const problemCounts = await Problem.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          solved: true
        }
      },
      {
        $group: {
          _id:    '$userId',
          total:  { $sum: 1 },
          easy:   {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] },   1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] }
          },
          hard:   {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] },   1, 0] }
          }
        }
      }
    ])

    // ─────────────────────────────────────────
    // STEP 4 — Create lookup map for fast access
    // ─────────────────────────────────────────
    const countMap = {}
    problemCounts.forEach(pc => {
      countMap[pc._id.toString()] = {
        total:  pc.total,
        easy:   pc.easy,
        medium: pc.medium,
        hard:   pc.hard
      }
    })

    // ─────────────────────────────────────────
    // STEP 5 — Build leaderboard entries
    // ─────────────────────────────────────────
    const leaderboard = users.map(user => {
      const counts = countMap[user._id.toString()] || {
        total: 0, easy: 0, medium: 0, hard: 0
      }

      return {
        userId:         user._id,
        name:           user.name,
        college:        user.college        || 'N/A',
        branch:         user.branch         || 'N/A',
        graduationYear: user.graduationYear,
        currentStreak:  user.currentStreak  || 0,
        longestStreak:  user.longestStreak  || 0,
        totalSolved:    counts.total,
        easy:           counts.easy,
        medium:         counts.medium,
        hard:           counts.hard,
        // Score formula — weights hard problems more
        score: (counts.easy * 1) + (counts.medium * 2) + (counts.hard * 3)
      }
    })

    // ─────────────────────────────────────────
    // STEP 6 — Sort by totalSolved descending
    // then by score for tie-breaking
    // ─────────────────────────────────────────
    leaderboard.sort((a, b) => {
      if (b.totalSolved !== a.totalSolved) {
        return b.totalSolved - a.totalSolved
      }
      return b.score - a.score
    })

    // ─────────────────────────────────────────
    // STEP 7 — Add rank numbers
    // ─────────────────────────────────────────
    const ranked = leaderboard
      .slice(0, Number(limit))
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }))

    res.status(200).json({
      success:     true,
      count:       ranked.length,
      leaderboard: ranked
    })

  } catch (error) {
    console.error('Leaderboard Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    })
  }
}

// ============================================
// @desc    Get unique colleges list
// @route   GET /api/leaderboard/colleges
// @access  Public
// Used to populate college filter dropdown
// ============================================
const getColleges = async (req, res) => {
  try {
    const colleges = await User.distinct('college', {
      college: { $ne: '' }
    })

    res.status(200).json({
      success:  true,
      colleges: colleges.sort()
    })

  } catch (error) {
    console.error('Get Colleges Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching colleges'
    })
  }
}

// ============================================
// @desc    Get unique branches list
// @route   GET /api/leaderboard/branches
// @access  Public
// Used to populate branch filter dropdown
// ============================================
const getBranches = async (req, res) => {
  try {
    const branches = await User.distinct('branch', {
      branch: { $ne: '' }
    })

    res.status(200).json({
      success:  true,
      branches: branches.sort()
    })

  } catch (error) {
    console.error('Get Branches Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching branches'
    })
  }
}

module.exports = {
  getLeaderboard,
  getColleges,
  getBranches
}