// ============================================
// models/Resume.js — Resume Tracker Schema
// Tracks resumes sent to different companies
// with version control and status tracking
// ============================================

const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // RESUME DETAILS
    // ------------------------------------------

    title: {
      type:      String,
      required:  [true, 'Resume title is required'],
      trim:      true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },

    // Which company this resume targets
    targetCompany: {
      type:    String,
      trim:    true,
      default: 'General'
    },

    // Link to the actual resume file
    // Google Drive, Dropbox, OneDrive etc.
    resumeLink: {
      type:    String,
      trim:    true,
      default: ''
    },

    // Version number — e.g. "v1", "v2", "Final"
    version: {
      type:    String,
      trim:    true,
      default: 'v1'
    },

    // ------------------------------------------
    // STATUS
    // ------------------------------------------
    status: {
      type:     String,
      required: [true, 'Status is required'],
      enum: {
        values:  ['Draft', 'Ready', 'Submitted', 'Updated'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Draft'
    },

    // ------------------------------------------
    // CONTENT TRACKING
    // What is highlighted in this resume version
    // ------------------------------------------
    highlights: {
      type:    [String],
      default: []
    },

    // User notes about this resume version
    notes: {
      type:      String,
      trim:      true,
      default:   '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },

    // ------------------------------------------
    // ATS SCORE (optional)
    // Store ATS score if user runs through checker
    // ------------------------------------------
    atsScore: {
      type:    Number,
      min:     0,
      max:     100,
      default: null
    },

    // ------------------------------------------
    // REFERENCE TO USER
    // ------------------------------------------
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User ID is required']
    }
  },

  {
    timestamps: true
  }
)

// ============================================
// INDEXES
// ============================================
resumeSchema.index({ userId: 1 })
resumeSchema.index({ userId: 1, status: 1 })
resumeSchema.index({ userId: 1, targetCompany: 1 })

// ============================================
// STATIC METHOD — getStatusCounts
// Returns count of resumes per status
// ============================================
resumeSchema.statics.getStatusCounts = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id:   '$status',
        count: { $sum: 1 }
      }
    }
  ])

  const result = {
    Draft:     0,
    Ready:     0,
    Submitted: 0,
    Updated:   0,
    total:     0
  }

  stats.forEach(item => {
    result[item._id]  = item.count
    result.total     += item.count
  })

  return result
}

// ============================================
// EXPORT MODEL
// Creates "resumes" collection in MongoDB
// ============================================
const Resume = mongoose.model('Resume', resumeSchema)

module.exports = Resume