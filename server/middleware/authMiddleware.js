// ============================================
// middleware/authMiddleware.js
// Protects private routes by verifying JWT
// Attaches decoded user to req.user
// ============================================

const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ============================================
// protect — Main auth middleware
// Usage: router.get('/route', protect, handler)
// ============================================
const protect = async (req, res, next) => {
  try {
    let token

    // ------------------------------------------
    // STEP 1 — Extract token from header
    // Frontend sends:
    // Authorization: Bearer eyJhbGciOiJIUzI1...
    // We split on space and take index [1]
    // ------------------------------------------
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
      // Split result:
      // index 0 → "Bearer"
      // index 1 → "eyJhbGciOiJIUzI1..." ← this is our token
    }

    // ------------------------------------------
    // STEP 2 — Check token exists
    // ------------------------------------------
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please login.'
      })
    }

    // ------------------------------------------
    // STEP 3 — Verify token signature & expiry
    // jwt.verify throws an error if:
    //   - Token signature is invalid (tampered)
    //   - Token has expired
    //   - Token is malformed
    // ------------------------------------------
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded contains: { id: 'user_mongodb_id', iat: ..., exp: ... }
    // iat = issued at timestamp
    // exp = expiry timestamp

    // ------------------------------------------
    // STEP 4 — Find user from decoded token id
    // We fetch fresh user data from DB every time
    // This handles the case where user was deleted
    // after token was issued
    // ------------------------------------------
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please login again.'
      })
    }

    // ------------------------------------------
    // STEP 5 — Attach user to request object
    // Now any route handler after this middleware
    // can access req.user to get logged-in user
    // Example: const userId = req.user._id
    // ------------------------------------------
    req.user = user

    // ------------------------------------------
    // STEP 6 — Call next()
    // Passes control to the actual route handler
    // Without this the request hangs forever
    // ------------------------------------------
    next()

  } catch (error) {
    // ------------------------------------------
    // JWT SPECIFIC ERRORS
    // ------------------------------------------

    // Token signature doesn't match — tampered token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      })
    }

    // Token has expired past its expiry time
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      })
    }

    // Any other unexpected error
    console.error('Auth Middleware Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    })
  }
}

// ============================================
// optionalAuth — For routes that work both
// with and without authentication
// Example: leaderboard (public view but
// can highlight current user if logged in)
// ============================================
const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // If no token — just continue without user
    if (!token) {
      req.user = null
      return next()
    }

    // If token exists — verify and attach user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id)
    req.user      = user || null

    next()

  } catch (error) {
    // Even if token is invalid — just continue
    // without user for optional routes
    req.user = null
    next()
  }
}

module.exports = { protect, optionalAuth }