// ============================================
// CompanyForm.jsx
// Modal form for adding/editing company applications
// ============================================

import { useState, useEffect } from 'react'
import API                     from '../../api/axios'
import '../../styles/companies.css'

const STATUSES = [
  'Applied', 'OA Cleared', 'Interview', 'HR Round', 'Selected', 'Rejected'
]

const defaultForm = {
  companyName: '',
  role:        '',
  package:     '',
  status:      'Applied',
  appliedDate: new Date().toISOString().split('T')[0],
  jobUrl:      '',
  notes:       ''
}

// company  → if provided, form is in EDIT mode
const CompanyForm = ({ company, onClose, onSave }) => {

  const [formData, setFormData] = useState(defaultForm)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        role:        company.role        || '',
        package:     company.package     || '',
        status:      company.status      || 'Applied',
        appliedDate: company.appliedDate
          ? new Date(company.appliedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        jobUrl:      company.jobUrl      || '',
        notes:       company.notes       || ''
      })
    }
  }, [company])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.companyName.trim() || !formData.role.trim()) {
      return setError('Company name and role are required')
    }

    try {
      setLoading(true)
      setError('')

      if (company) {
        await API.put(`/companies/${company._id}`, formData)
      } else {
        await API.post('/companies', formData)
      }

      onSave()
      onClose()

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save application. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!company

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Application' : '➕ Add Application'}
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

          {/* Role + Package */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="package">Package</label>
              <input
                type="text"
                id="package"
                name="package"
                value={formData.package}
                onChange={handleChange}
                placeholder="e.g. ₹12 LPA"
              />
            </div>
          </div>

          {/* Status + Applied Date */}
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
              <label htmlFor="appliedDate">Applied Date</label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Job URL */}
          <div className="form-group">
            <label htmlFor="jobUrl">Job Posting URL</label>
            <input
              type="url"
              id="jobUrl"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://careers.company.com/job/123"
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
              placeholder="Referral contact, interview feedback, next steps..."
              rows={3}
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
                isEditing ? 'Update Application' : 'Add Application'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default CompanyForm