// ============================================
// utils/generateToken.js
// Signs and returns a JWT token
// ============================================

const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload embedded in token
    process.env.JWT_SECRET,      // Secret used to sign
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

module.exports = generateToken