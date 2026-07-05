// ============================================
// middleware/errorMiddleware.js
// Centralized error handling middleware
// ============================================

// notFound — fires when no route matches
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// errorHandler — handles all errors
// 4 parameters tells Express this is an error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack:   process.env.NODE_ENV === 'production' ? null : err.stack
  })
}

module.exports = { notFound, errorHandler }