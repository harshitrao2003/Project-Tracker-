// ============================================
// Resumes.jsx — Resume Tracker Page
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/common/DashboardLayout'
import ResumeForm      from '../components/resumes/ResumeForm'
import ResumeCard      from '../components/resumes/ResumeCard'
import API             from '../api/axios'
import useAuth         from '../hooks/useAuth'
import '../styles/resumes.css'

const STATUSES    = ['All', 'Draft', 'Ready', 'Submitted', 'Updated']

const Resumes = () => {

  const { token, loading: authLoading } = useAuth()

  const [resumes,     setResumes]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editResume,  setEditResume]  = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search,      setSearch]      = useState('')

  // ─────────────────────────────────────────
  // FETCH RESUMES
  // ─────────────────────────────────────────
  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (filterStatus !== 'All') params.append('status', filterStatus)
      if (search)                 params.append('search', search)

      const response = await API.get(`/resumes?${params.toString()}`)
      setResumes(response.data.resumes || [])

    } catch (err) {
      console.error('Fetch Resumes Error:', err)
      setError('Failed to load resumes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => {
    if (!authLoading && token) {
      fetchResumes()
    }
  }, [fetchResumes, authLoading, token])

  // ─────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────
  const handleAddClick = () => {
    setEditResume(null)
    setShowForm(true)
  }

  const handleEditClick = (resume) => {
    setEditResume(resume)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditResume(null)
  }

  const handleFormSave = () => {
    fetchResumes()
  }

  // ─────────────────────────────────────────
  // DELETE HANDLERS
  // ─────────────────────────────────────────
  const handleDeleteClick  = (id) => setDeleteId(id)
  const handleDeleteCancel = ()   => setDeleteId(null)

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await API.delete(`/resumes/${deleteId}`)
      setDeleteId(null)
      fetchResumes()
    } catch (err) {
      setError('Failed to delete resume.')
    } finally {
      setDeleting(false)
    }
  }

  // ─────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────
  const totalResumes     = resumes.length
  const readyResumes     = resumes.filter(r => r.status === 'Ready').length
  const submittedResumes = resumes.filter(r => r.status === 'Submitted').length
  const avgAts           = resumes.filter(r => r.atsScore).length > 0
    ? Math.round(
        resumes
          .filter(r => r.atsScore)
          .reduce((sum, r) => sum + r.atsScore, 0) /
        resumes.filter(r => r.atsScore).length
      )
    : null

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Resume Tracker</h2>
            <p>Manage and track your resume versions</p>
          </div>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Resume
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="problems-stats">
        <div className="pstat-card">
          <span className="pstat-value">{totalResumes}</span>
          <span className="pstat-label">Total</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--success-color)' }}
          >
            {readyResumes}
          </span>
          <span className="pstat-label">Ready</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--primary-color)' }}
          >
            {submittedResumes}
          </span>
          <span className="pstat-label">Submitted</span>
        </div>
        {avgAts && (
          <div className="pstat-card">
            <span
              className="pstat-value"
              style={{ color: avgAts >= 80
                ? 'var(--success-color)'
                : 'var(--warning-color)'
              }}
            >
              {avgAts}%
            </span>
            <span className="pstat-label">Avg ATS</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="problems-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search resumes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Resume Cards Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading resumes...</h3>
        </div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No resumes found</h3>
          <p>
            {filterStatus !== 'All' || search
              ? 'Try clearing filters'
              : 'Add your first resume to start tracking'
            }
          </p>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Resume
          </button>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map(resume => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <ResumeForm
          resume={editResume}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-backdrop" onClick={handleDeleteCancel}>
          <div
            className="modal"
            style={{ maxWidth: '400px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">🗑️ Delete Resume</h2>
              <button
                className="modal-close"
                onClick={handleDeleteCancel}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{
                color:        'var(--text-muted)',
                marginBottom: '1.5rem'
              }}>
                Are you sure you want to delete this resume?
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}

export default Resumes
