// ============================================
// models/User.js — User Schema & Model
// Defines the structure of every user
// document stored in MongoDB
// ============================================

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

// ============================================
// USER SCHEMA
// mongoose.Schema defines the shape of
// documents inside the "users" collection
// ============================================
const userSchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // BASIC INFO
    // ------------------------------------------

    name: {
      type: String,
      required: [true, 'Name is required'],       // Custom error message
      trim: true,                                  // Removes leading/trailing spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                                // No two users can have same email
      trim: true,
      lowercase: true,                             // Always store email in lowercase
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'       // Regex validation error message
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false                                // Never return password in queries
                                                   // Must explicitly use .select('+password')
    },

    // ------------------------------------------
    // ACADEMIC INFO
    // ------------------------------------------

    college: {
      type: String,
      trim: true,
      default: ''
    },

    branch: {
      type: String,
      trim: true,
      default: ''
    },

    graduationYear: {
      type: Number,
      min: [2020, 'Graduation year seems too early'],
      max: [2035, 'Graduation year seems too far'],
      default: new Date().getFullYear()
    },

    // ------------------------------------------
    // PROFILE
    // ------------------------------------------

    profileImage: {
      type: String,
      default: ''                                  // URL to profile image
    },

    // ------------------------------------------
    // PROFESSIONAL LINKS
    // Added here so profile page can save them
    // ------------------------------------------

    linkedin: {
      type: String,
      default: ''
    },

    github: {
      type: String,
      default: ''
    },

    leetcode: {
      type: String,
      default: ''
    },

    geeksforgeeks: {
      type: String,
      default: ''
    },

    // ------------------------------------------
    // STREAK TRACKING
    // Updated automatically when problems solved
    // Full logic added in Step 25
    // ------------------------------------------

    currentStreak: {
      type: Number,
      default: 0                                   // Days in a row problems were solved
    },

    longestStreak: {
      type: Number,
      default: 0                                   // All-time best streak
    },

    lastSolvedDate: {
      type: Date,
      default: null                                // Last date a problem was marked solved
    }
  },

  // ============================================
  // SCHEMA OPTIONS
  // Second argument to mongoose.Schema
  // ============================================
  {
    timestamps: true
    // Automatically adds two fields to every document:
    // createdAt — when the user registered
    // updatedAt — when the user last updated their profile
  }
)

// ============================================
// PRE-SAVE MIDDLEWARE (Hook)
// Runs automatically BEFORE every .save() call
// Hashes the password before storing in DB
// ============================================
userSchema.pre('save', async function () {
  // "this" refers to the current user document

  // Only hash if password was changed or is new
  // Without this check, login would re-hash
  // an already-hashed password on profile update
  if (!this.isModified('password')) {
    return
  }

  // Generate a salt — random string added to password
  // before hashing to prevent rainbow table attacks
  // 12 = cost factor — higher means slower but more secure
  const salt = await bcrypt.genSalt(12)

  // Hash the plain text password with the salt
  // Example: "mypassword123" → "$2a$12$abc123..."
  this.password = await bcrypt.hash(this.password, salt)
})

// ============================================
// INSTANCE METHOD — matchPassword
// Called on a user document to check password
// Usage: await user.matchPassword(enteredPassword)
// ============================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare hashes enteredPassword and
  // compares it with the stored hash
  // Returns true if they match, false otherwise
  return await bcrypt.compare(enteredPassword, this.password)
}

// ============================================
// VIRTUAL FIELD — fullProfile
// Virtuals are computed fields — not stored in DB
// Available when you access user.fullProfile
// ============================================
userSchema.virtual('fullProfile').get(function () {
  return {
    id:             this._id,
    name:           this.name,
    email:          this.email,
    college:        this.college,
    branch:         this.branch,
    graduationYear: this.graduationYear,
    profileImage:   this.profileImage,
    linkedin:       this.linkedin,
    github:         this.github,
    leetcode:       this.leetcode,
    geeksforgeeks:  this.geeksforgeeks,
    currentStreak:  this.currentStreak,
    longestStreak:  this.longestStreak,
    createdAt:      this.createdAt
  }
})

// ============================================
// CREATE MODEL (done after methods are attached)
// Model compilation moved to the end so instance
// methods defined below are available on documents
// ============================================

// ============================================
// INSTANCE METHOD — updateStreak
// Called whenever a problem is marked solved
// Handles all streak edge cases properly
// ============================================
userSchema.methods.updateStreak = async function () {

  // ─────────────────────────────────────────
  // Get today's date at midnight (00:00:00)
  // This removes time component for comparison
  // ─────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ─────────────────────────────────────────
  // Get yesterday's date at midnight
  // ─────────────────────────────────────────
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // ─────────────────────────────────────────
  // Normalize lastSolvedDate to midnight too
  // so comparison is always date-only
  // ─────────────────────────────────────────
  let lastSolved = null
  if (this.lastSolvedDate) {
    lastSolved = new Date(this.lastSolvedDate)
    lastSolved.setHours(0, 0, 0, 0)
  }

  // ─────────────────────────────────────────
  // CASE 1 — Never solved anything before
  // Start streak at 1
  // ─────────────────────────────────────────
  if (!lastSolved) {
    this.currentStreak = 1
  }

  // ─────────────────────────────────────────
  // CASE 2 — Already solved a problem today
  // Don't increment — streak stays same
  // (Prevents solving 5 problems in a day
  //  from counting as 5 streak days)
  // ─────────────────────────────────────────
  else if (lastSolved.getTime() === today.getTime()) {
    // No change to currentStreak
  }

  // ─────────────────────────────────────────
  // CASE 3 — Last solved yesterday
  // Continue the streak — increment by 1
  // ─────────────────────────────────────────
  else if (lastSolved.getTime() === yesterday.getTime()) {
    this.currentStreak += 1
  }

  // ─────────────────────────────────────────
  // CASE 4 — Gap of more than 1 day
  // Streak is broken — reset to 1
  // ─────────────────────────────────────────
  else {
    this.currentStreak = 1
  }

  // ─────────────────────────────────────────
  // Update longest streak if current beats it
  // ─────────────────────────────────────────
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak
  }

  // ─────────────────────────────────────────
  // Always update lastSolvedDate to now
  // ─────────────────────────────────────────
  this.lastSolvedDate = new Date()

  await this.save()

  return {
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak
  }
}

// ============================================
// INSTANCE METHOD — checkStreakValidity
// Called on login / dashboard load
// Resets streak to 0 if user missed a day
// (didn't solve yesterday AND not today)
// ============================================
userSchema.methods.checkStreakValidity = async function () {

  if (!this.lastSolvedDate || this.currentStreak === 0) {
    return this.currentStreak
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastSolved = new Date(this.lastSolvedDate)
  lastSolved.setHours(0, 0, 0, 0)

  // If last solved was NOT today and NOT yesterday
  // the streak is broken — reset to 0
  if (
    lastSolved.getTime() !== today.getTime() &&
    lastSolved.getTime() !== yesterday.getTime()
  ) {
    this.currentStreak = 0
    await this.save()
  }

  return this.currentStreak
}

// Compile model after all methods are attached
const User = mongoose.model('User', userSchema)

module.exports = User