// ============================================
// Interviews.jsx — Mock Interview Tracker Page
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout  from '../components/common/DashboardLayout'
import InterviewForm    from '../components/interviews/InterviewForm'
import InterviewCard    from '../components/interviews/InterviewCard'
import API              from '../api/axios'
import useAuth          from '../hooks/useAuth'
import '../styles/interviews.css'

const TYPES   = ['All', 'DSA', 'Technical', 'HR', 'System Design', 'Group Discussion', 'Machine Coding', 'Behavioral']
const RESULTS = ['All', 'Passed', 'Failed', 'Pending', 'No Result']

const Interviews = () => {

  const { token, loading: authLoading } = useAuth()

  const [interviews,   setInterviews]   = useState([])
  const [analytics,    setAnalytics]    = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [editInterview,setEditInterview]= useState(null)
  const [deleteId,     setDeleteId]     = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [filterType,   setFilterType]   = useState('All')
  const [filterResult, setFilterResult] = useState('All')

  // ─────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (filterType   !== 'All') params.append('interviewType', filterType)
      if (filterResult !== 'All') params.append('result',        filterResult)

      const [interviewsRes, analyticsRes] = await Promise.all([
        API.get(`/interviews?${params.toString()}`),
        API.get('/interviews/analytics')
      ])

      setInterviews(interviewsRes.data.interviews || [])
      setAnalytics(analyticsRes.data.analytics)

    } catch (err) {
      console.error('Fetch Interviews Error:', err)
      setError('Failed to load interviews. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filterType, filterResult])

  useEffect(() => {
    if (!authLoading && token) {
      fetchData()
    }
  }, [fetchData, authLoading, token])

  // ─────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────
  const handleAddClick = () => {
    setEditInterview(null)
    setShowForm(true)
  }

  const handleEditClick = (interview) => {
    setEditInterview(interview)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditInterview(null)
  }

  const handleFormSave = () => fetchData()

  // ─────────────────────────────────────────
  // DELETE HANDLERS
  // ─────────────────────────────────────────
  const handleDeleteClick  = (id) => setDeleteId(id)
  const handleDeleteCancel = ()   => setDeleteId(null)

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await API.delete(`/interviews/${deleteId}`)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      setError('Failed to delete interview.')
    } finally {
      setDeleting(false)
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Mock Interviews</h2>
            <p>Track and analyze your interview performance</p>
          </div>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Interview
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="interview-analytics">
          <div className="interview-stat-card">
            <div className="interview-stat-icon">🎤</div>
            <div className="interview-stat-info">
              <div className="interview-stat-value">
                {analytics.totalInterviews}
              </div>
              <div className="interview-stat-label">Total Sessions</div>
            </div>
          </div>

          <div className="interview-stat-card">
            <div className="interview-stat-icon">⭐</div>
            <div className="interview-stat-info">
              <div
                className="interview-stat-value"
                style={{ color: 'var(--warning-color)' }}
              >
                {analytics.avgScore || 0}
              </div>
              <div className="interview-stat-label">Avg Score</div>
            </div>
          </div>

          <div className="interview-stat-card">
            <div className="interview-stat-icon">🏆</div>
            <div className="interview-stat-info">
              <div
                className="interview-stat-value"
                style={{ color: 'var(--success-color)' }}
              >
                {analytics.bestScore || 0}
              </div>
              <div className="interview-stat-label">Best Score</div>
            </div>
          </div>

          <div className="interview-stat-card">
            <div className="interview-stat-icon">✅</div>
            <div className="interview-stat-info">
              <div
                className="interview-stat-value"
                style={{ color: 'var(--success-color)' }}
              >
                {analytics.resultStats?.Passed || 0}
              </div>
              <div className="interview-stat-label">Passed</div>
            </div>
          </div>

          <div className="interview-stat-card">
            <div className="interview-stat-icon">❌</div>
            <div className="interview-stat-info">
              <div
                className="interview-stat-value"
                style={{ color: 'var(--danger-color)' }}
              >
                {analytics.resultStats?.Failed || 0}
              </div>
              <div className="interview-stat-label">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* Type Performance */}
      {analytics?.typeStats?.length > 0 && (
        <div className="interview-type-grid">
          {analytics.typeStats.map(t => (
            <div key={t.type} className="interview-type-card">
              <span className="interview-type-name">{t.type}</span>
              <span className="interview-type-count">
                {t.count} session{t.count !== 1 ? 's' : ''}
              </span>
              {t.avgScore > 0 && (
                <span
                  className="interview-type-score"
                  style={{
                    color: t.avgScore >= 8
                      ? 'var(--success-color)'
                      : t.avgScore >= 6
                      ? 'var(--warning-color)'
                      : 'var(--danger-color)'
                  }}
                >
                  Avg: {t.avgScore}/10
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="problems-toolbar">
        <select
          className="filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          {TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterResult}
          onChange={e => setFilterResult(e.target.value)}
        >
          {RESULTS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          className="btn-secondary"
          onClick={() => {
            setFilterType('All')
            setFilterResult('All')
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Interview Cards */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading interviews...</h3>
        </div>
      ) : interviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎤</div>
          <h3>No interviews found</h3>
          <p>
            {filterType !== 'All' || filterResult !== 'All'
              ? 'Try clearing filters'
              : 'Add your first mock interview session'
            }
          </p>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Interview
          </button>
        </div>
      ) : (
        <div className="interview-grid">
          {interviews.map(interview => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <InterviewForm
          interview={editInterview}
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
              <h2 className="modal-title">🗑️ Delete Interview</h2>
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
                Are you sure you want to delete this interview record?
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

export default Interviews
