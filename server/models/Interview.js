// ============================================
// models/Interview.js — Mock Interview Schema
// Tracks mock interview sessions with scores
// and feedback for improvement tracking
// ============================================

const mongoose = require('mongoose')

const interviewSchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // INTERVIEW DETAILS
    // ------------------------------------------

    companyName: {
      type:      String,
      required:  [true, 'Company name is required'],
      trim:      true,
      maxlength: [150, 'Company name cannot exceed 150 characters']
    },

    // Type of interview round
    interviewType: {
      type:     String,
      required: [true, 'Interview type is required'],
      enum: {
        values: [
          'DSA',
          'Technical',
          'HR',
          'System Design',
          'Group Discussion',
          'Machine Coding',
          'Behavioral'
        ],
        message: '{VALUE} is not a valid interview type'
      }
    },

    // Date interview was conducted
    date: {
      type:     Date,
      required: [true, 'Interview date is required'],
      default:  Date.now
    },

    // ------------------------------------------
    // PERFORMANCE
    // ------------------------------------------

    // Score out of 10
    score: {
      type:    Number,
      min:     [0,  'Score cannot be less than 0'],
      max:     [10, 'Score cannot be more than 10'],
      default: null
    },

    // Overall result
    result: {
      type:    String,
      enum: {
        values:  ['Passed', 'Failed', 'Pending', 'No Result'],
        message: '{VALUE} is not a valid result'
      },
      default: 'Pending'
    },

    // Duration in minutes
    duration: {
      type:    Number,
      min:     0,
      default: 60
    },

    // ------------------------------------------
    // FEEDBACK & IMPROVEMENT
    // ------------------------------------------

    // Detailed feedback from interviewer or self
    feedback: {
      type:      String,
      trim:      true,
      default:   '',
      maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },

    // Specific topics covered in interview
    topicsCovered: {
      type:    [String],
      default: []
    },

    // What to improve for next time
    nextAction: {
      type:      String,
      trim:      true,
      default:   '',
      maxlength: [500, 'Next action cannot exceed 500 characters']
    },

    // Difficulty felt by candidate
    difficulty: {
      type:    String,
      enum: {
        values:  ['Easy', 'Medium', 'Hard', 'Very Hard'],
        message: '{VALUE} is not a valid difficulty'
      },
      default: 'Medium'
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
interviewSchema.index({ userId: 1 })
interviewSchema.index({ userId: 1, interviewType: 1 })
interviewSchema.index({ userId: 1, date: -1 })

// ============================================
// STATIC METHOD — getAnalytics
// Returns interview statistics for dashboard
// ============================================
interviewSchema.statics.getAnalytics = async function(userId) {

  const [
    typeStats,
    scoreStats,
    resultStats
  ] = await Promise.all([

    // Count by interview type
    this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id:   '$interviewType',
          count: { $sum: 1 },
          avgScore: {
            $avg: '$score'
          }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Overall score stats
    this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          score:  { $ne: null }
        }
      },
      {
        $group: {
          _id:      null,
          avgScore: { $avg:  '$score' },
          maxScore: { $max:  '$score' },
          minScore: { $min:  '$score' },
          total:    { $sum:  1 }
        }
      }
    ]),

    // Count by result
    this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id:   '$result',
          count: { $sum: 1 }
        }
      }
    ])
  ])

  // Format score stats
  const scores = scoreStats[0] || {
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
    total:    0
  }

  // Format result counts
  const results = {
    Passed:    0,
    Failed:    0,
    Pending:   0,
    'No Result': 0
  }

  resultStats.forEach(item => {
    results[item._id] = item.count
  })

  return {
    totalInterviews: await this.countDocuments({ userId }),
    avgScore:        Math.round((scores.avgScore || 0) * 10) / 10,
    bestScore:       scores.maxScore || 0,
    worstScore:      scores.minScore || 0,
    typeStats:       typeStats.map(t => ({
      type:     t._id,
      count:    t.count,
      avgScore: Math.round((t.avgScore || 0) * 10) / 10
    })),
    resultStats: results
  }
}

// ============================================
// EXPORT MODEL
// Creates "interviews" collection in MongoDB
// ============================================
const Interview = mongoose.model('Interview', interviewSchema)

module.exports = Interview