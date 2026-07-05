// ============================================
// controllers/authController.js
// Handles Register, Login, Logout, Get Me
// ============================================

const User          = require('../models/User')
const generateToken = require('../utils/generateToken')

// ============================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ============================================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      branch,
      graduationYear
    } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    // Create user — password hashed by pre('save') hook
    const user = await User.create({
      name,
      email,
      password,
      college:        college        || '',
      branch:         branch         || '',
      graduationYear: graduationYear || new Date().getFullYear()
    })

    // Generate JWT token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        college:        user.college,
        branch:         user.branch,
        graduationYear: user.graduationYear,
        profileImage:   user.profileImage,
        currentStreak:  user.currentStreak,
        longestStreak:  user.longestStreak,
        createdAt:      user.createdAt
      }
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    console.error('Register Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    })
  }
}

// ============================================
// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
// ============================================
const loginUser = async (req, res) => {
  try {
    // ------------------------------------------
    // STEP 1 — Extract credentials from body
    // ------------------------------------------
    const { email, password } = req.body

    // ------------------------------------------
    // STEP 2 — Validate fields present
    // ------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // ------------------------------------------
    // STEP 3 — Find user by email
    // We use .select('+password') because
    // password has select:false in the schema
    // Without this, password field is not returned
    // and bcrypt.compare would fail
    // ------------------------------------------
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password')

    // ------------------------------------------
    // STEP 4 — Check if user exists
    // We give a vague message intentionally —
    // never tell attackers which field is wrong
    // ------------------------------------------
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // ------------------------------------------
    // STEP 5 — Compare entered password with hash
    // matchPassword is defined in User.js
    // Uses bcrypt.compare internally
    // ------------------------------------------
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // ------------------------------------------
    // STEP 6 — Generate fresh JWT token
    // ------------------------------------------
    const token = generateToken(user._id)

    // ------------------------------------------
    // STEP 7 — Send response
    // ------------------------------------------
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        college:        user.college,
        branch:         user.branch,
        graduationYear: user.graduationYear,
        profileImage:   user.profileImage,
        linkedin:       user.linkedin,
        github:         user.github,
        leetcode:       user.leetcode,
        geeksforgeeks:  user.geeksforgeeks,
        currentStreak:  user.currentStreak,
        longestStreak:  user.longestStreak,
        createdAt:      user.createdAt
      }
    })

  } catch (error) {
    console.error('Login Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    })
  }
}

// ============================================
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ============================================
const logoutUser = async (req, res) => {
  // JWT is stateless — tokens live on the client
  // We cannot "invalidate" a JWT on the server
  // without a token blacklist (overkill for this project)
  // So logout simply tells the frontend to delete the token
  // The frontend clears localStorage on receiving this response
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
}

// ============================================
// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private (requires valid JWT)
// ============================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if streak is still valid
    // (resets to 0 if user missed a day)
    await user.checkStreakValidity()

    res.status(200).json({
      success: true,
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        college:        user.college,
        branch:         user.branch,
        graduationYear: user.graduationYear,
        profileImage:   user.profileImage,
        linkedin:       user.linkedin,
        github:         user.github,
        leetcode:       user.leetcode,
        geeksforgeeks:  user.geeksforgeeks,
        currentStreak:  user.currentStreak,
        longestStreak:  user.longestStreak,
        createdAt:      user.createdAt
      }
    })

  } catch (error) {
    console.error('Get Me Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
}