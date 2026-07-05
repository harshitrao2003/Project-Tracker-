// ============================================
// config/db.js — MongoDB Atlas Connection
// Handles connection with proper options
// and detailed logging
// ============================================

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Attempt connection
    const conn = await mongoose.connect(process.env.MONGO_URI)

    // Log success with the host name (cluster address)
    console.log(`✅ MongoDB Connected Successfully`)
    console.log(`   Host: ${conn.connection.host}`)
    console.log(`   Database: ${conn.connection.name}`)

  } catch (error) {
    // Log exactly what went wrong
    console.error(`❌ MongoDB Connection Failed`)
    console.error(`   Error: ${error.message}`)

    // Stop the server — no point running without a database
    process.exit(1)
  }
}

// ============================================
// MONGOOSE EVENT LISTENERS
// These fire automatically on connection events
// Helps debug connection drops in production
// ============================================

// Fires when connection is lost after being established
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Disconnected')
})

// Fires when successfully reconnected after a drop
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB Reconnected')
})

// Fires on any connection error after initial connect
mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Error: ${err.message}`)
})

module.exports = connectDB