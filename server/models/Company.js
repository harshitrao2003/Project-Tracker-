// ============================================
// models/Company.js — Company Application Schema
// Tracks job applications through pipeline stages
// ============================================

const mongoose = require('mongoose')

const companySchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // COMPANY DETAILS
    // ------------------------------------------

    companyName: {
      type:      String,
      required:  [true, 'Company name is required'],
      trim:      true,
      maxlength: [150, 'Company name cannot exceed 150 characters']
    },

    role: {
      type:      String,
      required:  [true, 'Role is required'],
      trim:      true,
      maxlength: [150, 'Role cannot exceed 150 characters']
    },

    // Package offered/expected — stored as string
    // to allow flexible formats like "12 LPA", "₹15-18 LPA"
    package: {
      type:    String,
      trim:    true,
      default: ''
    },

    // ------------------------------------------
    // APPLICATION STATUS
    // ------------------------------------------

    status: {
      type:     String,
      required: [true, 'Status is required'],
      enum: {
        values: [
          'Applied',
          'OA Cleared',
          'Interview',
          'HR Round',
          'Selected',
          'Rejected'
        ],
        message: '{VALUE} is not a valid status'
      },
      default: 'Applied'
    },

    appliedDate: {
      type:    Date,
      default: Date.now
    },

    // Optional — link to job posting
    jobUrl: {
      type:    String,
      trim:    true,
      default: ''
    },

    // User notes — interview rounds, feedback, contacts etc.
    notes: {
      type:      String,
      trim:      true,
      default:   '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },

    // ------------------------------------------
    // STATUS HISTORY
    // Tracks every status change with timestamp
    // Useful for timeline view in UI
    // ------------------------------------------
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'Applied',
            'OA Cleared',
            'Interview',
            'HR Round',
            'Selected',
            'Rejected'
          ]
        },
        date: {
          type:    Date,
          default: Date.now
        }
      }
    ],

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
companySchema.index({ userId: 1 })
companySchema.index({ userId: 1, status: 1 })
companySchema.index({ userId: 1, appliedDate: -1 })

// ============================================
// PRE SAVE HOOK
// Automatically logs status changes to history
// Regular function — NOT arrow function
// ============================================
companySchema.pre('save', function () {

  // On first creation — add initial status to history
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date:   new Date()
    })
  }

  // On status change — append to history
  else if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date:   new Date()
    })
  }

})

// ============================================
// STATIC METHOD — getStatusCounts
// Returns count of applications per status
// Used for pipeline board summary
// ============================================
companySchema.statics.getStatusCounts = async function (userId) {

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
    Applied:    0,
    'OA Cleared': 0,
    Interview:  0,
    'HR Round': 0,
    Selected:   0,
    Rejected:   0,
    total:      0
  }

  stats.forEach(item => {
    result[item._id]  = item.count
    result.total     += item.count
  })

  return result
}

// ============================================
// EXPORT MODEL
// Creates "companies" collection in MongoDB
// ============================================
const Company = mongoose.model('Company', companySchema)

module.exports = Company