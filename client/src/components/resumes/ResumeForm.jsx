// ============================================
// ResumeForm.jsx
// Modal form for adding/editing resumes
// ============================================

import { useState, useEffect } from 'react'
import API                     from '../../api/axios'

const STATUSES = ['Draft', 'Ready', 'Submitted', 'Updated']

const defaultForm = {
  title:         '',
  targetCompany: '',
  resumeLink:    '',
  version:       'v1',
  status:        'Draft',
  highlights:    '',
  notes:         '',
  atsScore:      ''
}

const ResumeForm = ({ resume, onClose, onSave }) => {

  const [formData, setFormData] = useState(defaultForm)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (resume) {
      setFormData({
        title:         resume.title         || '',
        targetCompany: resume.targetCompany || '',
        resumeLink:    resume.resumeLink    || '',
        version:       resume.version       || 'v1',
        status:        resume.status        || 'Draft',
        highlights:    resume.highlights?.join(', ') || '',
        notes:         resume.notes         || '',
        atsScore:      resume.atsScore      || ''
      })
    }
  }, [resume])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      return setError('Resume title is required')
    }

    // Convert comma-separated highlights to array
    const highlights = formData.highlights
      ? formData.highlights.split(',').map(h => h.trim()).filter(Boolean)
      : []

    const payload = {
      ...formData,
      highlights,
      atsScore: formData.atsScore ? Number(formData.atsScore) : null
    }

    try {
      setLoading(true)
      setError('')

      if (resume) {
        await API.put(`/resumes/${resume._id}`, payload)
      } else {
        await API.post('/resumes', payload)
      }

      onSave()
      onClose()

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save resume. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!resume

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '560px' }}
      >

        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Resume' : '➕ Add Resume'}
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

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Resume Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Google SWE Resume"
              autoFocus
            />
          </div>

          {/* Target Company + Version */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetCompany">Target Company</label>
              <input
                type="text"
                id="targetCompany"
                name="targetCompany"
                value={formData.targetCompany}
                onChange={handleChange}
                placeholder="e.g. Google"
              />
            </div>

            <div className="form-group">
              <label htmlFor="version">Version</label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="e.g. v1, v2, Final"
              />
            </div>
          </div>

          {/* Status + ATS Score */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="atsScore">ATS Score (0-100)</label>
              <input
                type="number"
                id="atsScore"
                name="atsScore"
                value={formData.atsScore}
                onChange={handleChange}
                placeholder="e.g. 85"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Resume Link */}
          <div className="form-group">
            <label htmlFor="resumeLink">Resume Link</label>
            <input
              type="url"
              id="resumeLink"
              name="resumeLink"
              value={formData.resumeLink}
              onChange={handleChange}
              placeholder="https://drive.google.com/file/..."
            />
          </div>

          {/* Highlights */}
          <div className="form-group">
            <label htmlFor="highlights">
              Key Highlights
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
              id="highlights"
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              placeholder="React projects, System design, Open source"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Tailored for specific role, changes made..."
              rows={2}
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
                isEditing ? 'Update Resume' : 'Add Resume'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default ResumeForm