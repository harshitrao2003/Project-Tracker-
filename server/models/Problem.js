const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Problem title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    topic: {
      type:     String,
      required: [true, 'Topic is required'],
      trim:     true,
      enum: {
        values: [
          'Arrays',
          'Strings',
          'Linked List',
          'Stack',
          'Queue',
          'Trees',
          'Graphs',
          'Dynamic Programming',
          'Recursion',
          'Backtracking',
          'Binary Search',
          'Sorting',
          'Hashing',
          'Greedy',
          'Math',
          'Two Pointers',
          'Sliding Window',
          'Heap',
          'Trie',
          'Bit Manipulation',
          'Other'
        ],
        message: '{VALUE} is not a valid topic'
      }
    },

    difficulty: {
      type:     String,
      required: [true, 'Difficulty is required'],
      enum: {
        values:  ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty'
      }
    },

    platform: {
      type:     String,
      required: [true, 'Platform is required'],
      enum: {
        values: [
          'LeetCode',
          'GeeksforGeeks',
          'HackerRank',
          'CodeChef',
          'Codeforces',
          'InterviewBit',
          'HackerEarth',
          'Other'
        ],
        message: '{VALUE} is not a valid platform'
      }
    },

    problemUrl: {
      type:    String,
      trim:    true,
      default: ''
    },

    notes: {
      type:      String,
      trim:      true,
      default:   '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },

    solved: {
      type:    Boolean,
      default: false
    },

    solvedDate: {
      type:    Date,
      default: null
    },

    revisionCount: {
      type:    Number,
      default: 0
    },

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
problemSchema.index({ userId: 1 })
problemSchema.index({ userId: 1, topic: 1 })
problemSchema.index({ userId: 1, difficulty: 1 })
problemSchema.index({ userId: 1, solvedDate: -1 })

// ============================================
// PRE SAVE HOOK
// Regular function — NOT arrow function
// Arrow functions break 'this' in mongoose hooks
// ============================================
problemSchema.pre('save', function () {
  if (this.solved === true && !this.solvedDate) {
    this.solvedDate = new Date()
  }
  if (this.solved === false) {
    this.solvedDate = null
  }
})

// ============================================
// STATIC METHOD — getStatsByUser
// ============================================
problemSchema.statics.getStatsByUser = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        solved: true
      }
    },
    {
      $group: {
        _id:   '$difficulty',
        count: { $sum: 1 }
      }
    }
  ])

  const result = { Easy: 0, Medium: 0, Hard: 0, total: 0 }

  stats.forEach(function(item) {
    result[item._id]  = item.count
    result.total     += item.count
  })

  return result
}

// ============================================
// STATIC METHOD — getTopicStats
// ============================================
problemSchema.statics.getTopicStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id:    '$topic',
        total:  { $sum: 1 },
        solved: {
          $sum: { $cond: ['$solved', 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return stats.map(function(item) {
    return {
      topic:  item._id,
      total:  item.total,
      solved: item.solved
    }
  })
}

// ============================================
// STATIC METHOD — getWeeklyStats
// ============================================
problemSchema.statics.getWeeklyStats = async function(userId) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const stats = await this.aggregate([
    {
      $match: {
        userId:     new mongoose.Types.ObjectId(userId),
        solved:     true,
        solvedDate: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format:   '%Y-%m-%d',
            date:     '$solvedDate',
            timezone: 'UTC'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return stats.map(function(item) {
    return {
      date:  item._id,
      count: item.count
    }
  })
}
// ============================================
// STATIC METHOD — getMonthlyStats
// Returns problems solved per month
// for the last 6 months
// ============================================
problemSchema.statics.getMonthlyStats = async function(userId) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const stats = await this.aggregate([
    {
      $match: {
        userId:     new mongoose.Types.ObjectId(userId),
        solved:     true,
        solvedDate: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date:   '$solvedDate'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return stats.map(function(item) {
    return {
      month: item._id,
      count: item.count
    }
  })
}

// ============================================
// EXPORT MODEL
// ============================================
const Problem = mongoose.model('Problem', problemSchema)

module.exports = Problem