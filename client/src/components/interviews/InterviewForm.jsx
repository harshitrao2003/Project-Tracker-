// ============================================
// InterviewForm.jsx
// Modal form for adding/editing interview records
// ============================================

import { useState, useEffect } from 'react'
import API                     from '../../api/axios'

const INTERVIEW_TYPES = [
  'DSA', 'Technical', 'HR', 'System Design',
  'Group Discussion', 'Machine Coding', 'Behavioral'
]

const RESULTS     = ['Pending', 'Passed', 'Failed', 'No Result']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Very Hard']

const defaultForm = {
  companyName:   '',
  interviewType: 'DSA',
  date:          new Date().toISOString().split('T')[0],
  score:         '',
  result:        'Pending',
  duration:      60,
  feedback:      '',
  topicsCovered: '',
  nextAction:    '',
  difficulty:    'Medium'
}

const InterviewForm = ({ interview, onClose, onSave }) => {

  const [formData, setFormData] = useState(defaultForm)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (interview) {
      setFormData({
        companyName:   interview.companyName   || '',
        interviewType: interview.interviewType || 'DSA',
        date:          interview.date
          ? new Date(interview.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        score:         interview.score         ?? '',
        result:        interview.result        || 'Pending',
        duration:      interview.duration      || 60,
        feedback:      interview.feedback      || '',
        topicsCovered: interview.topicsCovered?.join(', ') || '',
        nextAction:    interview.nextAction    || '',
        difficulty:    interview.difficulty    || 'Medium'
      })
    }
  }, [interview])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.companyName.trim() || !formData.interviewType) {
      return setError('Company name and interview type are required')
    }

    const topicsCovered = formData.topicsCovered
      ? formData.topicsCovered.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const payload = {
      ...formData,
      topicsCovered,
      score:    formData.score !== '' ? Number(formData.score) : null,
      duration: Number(formData.duration)
    }

    try {
      setLoading(true)
      setError('')

      if (interview) {
        await API.put(`/interviews/${interview._id}`, payload)
      } else {
        await API.post('/interviews', payload)
      }

      onSave()
      onClose()

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save interview. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!interview

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >

        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Interview' : '➕ Add Interview'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="form-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="problem-form">

          {/* Company Name */}
          <div className="form-group">
            <label htmlFor="companyName">
              Company Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Google"
              autoFocus
            />
          </div>

          {/* Interview Type + Date */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interviewType">
                Interview Type <span className="required">*</span>
              </label>
              <select
                id="interviewType"
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
              >
                {INTERVIEW_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Score + Result */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score">Score (0-10)</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleChange}
                placeholder="e.g. 8"
                min="0"
                max="10"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="result">Result</label>
              <select
                id="result"
                name="result"
                value={formData.result}
                onChange={handleChange}
              >
                {RESULTS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration + Difficulty */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 60"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
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

          {/* Topics Covered */}
          <div className="form-group">
            <label htmlFor="topicsCovered">
              Topics Covered
              <span style={{
                fontSize:   '0.75rem',
                color:      'var(--text-muted)',
                marginLeft: '0.5rem'
              }}>
                (comma separated)
              </span>
            </label>
            <input
              type="text"
              id="topicsCovered"
              name="topicsCovered"
              value={formData.topicsCovered}
              onChange={handleChange}
              placeholder="Arrays, DP, System Design"
            />
          </div>

          {/* Feedback */}
          <div className="form-group">
            <label htmlFor="feedback">Feedback</label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              placeholder="What went well, what to improve..."
              rows={3}
            />
          </div>

          {/* Next Action */}
          <div className="form-group">
            <label htmlFor="nextAction">Next Action</label>
            <input
              type="text"
              id="nextAction"
              name="nextAction"
              value={formData.nextAction}
              onChange={handleChange}
              placeholder="What will you do to improve?"
            />
          </div>

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
                isEditing ? 'Update Interview' : 'Add Interview'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default InterviewForm