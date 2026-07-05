// ============================================
// ProblemForm.jsx
// Modal form for adding and editing problems
// Used by Problems.jsx page
// ============================================

import { useState, useEffect } from 'react'
import API                     from '../../api/axios'
import '../../styles/problems.css'

// Topics and platforms match server enum values
const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion',
  'Backtracking', 'Binary Search', 'Sorting', 'Hashing',
  'Greedy', 'Math', 'Two Pointers', 'Sliding Window',
  'Heap', 'Trie', 'Bit Manipulation', 'Other'
]

const PLATFORMS = [
  'LeetCode', 'GeeksforGeeks', 'HackerRank',
  'CodeChef', 'Codeforces', 'InterviewBit',
  'HackerEarth', 'Other'
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// ─────────────────────────────────────────
// Default empty form state
// ─────────────────────────────────────────
const defaultForm = {
  title:      '',
  topic:      'Arrays',
  difficulty: 'Easy',
  platform:   'LeetCode',
  problemUrl: '',
  notes:      '',
  solved:     false
}

// problem  → if provided, form is in EDIT mode
// onClose  → closes the modal
// onSave   → refreshes problem list after save
const ProblemForm = ({ problem, onClose, onSave }) => {

  const [formData, setFormData] = useState(defaultForm)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // ─────────────────────────────────────────
  // If editing — populate form with problem data
  // ─────────────────────────────────────────
  useEffect(() => {
    if (problem) {
      setFormData({
        title:      problem.title      || '',
        topic:      problem.topic      || 'Arrays',
        difficulty: problem.difficulty || 'Easy',
        platform:   problem.platform   || 'LeetCode',
        problemUrl: problem.problemUrl || '',
        notes:      problem.notes      || '',
        solved:     problem.solved     || false
      })
    }
  }, [problem])

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      // Handle checkbox separately
      [name]: type === 'checkbox' ? checked : value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.title.trim()) {
      return setError('Problem title is required')
    }

    try {
      setLoading(true)
      setError('')

      if (problem) {
        // EDIT MODE — update existing problem
        await API.put(`/problems/${problem._id}`, formData)
      } else {
        // ADD MODE — create new problem
        await API.post('/problems', formData)
      }

      // Notify parent to refresh list
      onSave()
      onClose()

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save problem. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  const isEditing = !!problem

  return (
    // Modal backdrop — clicking it closes the form
    <div className="modal-backdrop" onClick={onClose}>

      {/* Modal box — stop click from reaching backdrop */}
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Problem' : '➕ Add Problem'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="form-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="problem-form">

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Problem Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Two Sum"
              autoFocus
            />
          </div>

          {/* Topic + Difficulty */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="topic">
                Topic <span className="required">*</span>
              </label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
              >
                {TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">
                Difficulty <span className="required">*</span>
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform + Problem URL */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="platform">
                Platform <span className="required">*</span>
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="problemUrl">Problem URL</label>
              <input
                type="url"
                id="problemUrl"
                name="problemUrl"
                value={formData.problemUrl}
                onChange={handleChange}
                placeholder="https://leetcode.com/problems/..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Approach used, time complexity, things to remember..."
              rows={3}
            />
          </div>

          {/* Solved Checkbox */}
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="solved"
              name="solved"
              checked={formData.solved}
              onChange={handleChange}
            />
            <label htmlFor="solved">
              Mark as Solved
            </label>
          </div>

          {/* Difficulty Badge Preview */}
          <div className="difficulty-preview">
            <span>Difficulty:</span>
            <span className={`difficulty-badge difficulty-${formData.difficulty.toLowerCase()}`}>
              {formData.difficulty}
            </span>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                isEditing ? 'Update Problem' : 'Add Problem'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default ProblemForm