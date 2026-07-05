// ============================================
// Companies.jsx — Application Pipeline Page
// Kanban board with drag-and-drop status update
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/common/DashboardLayout'
import CompanyForm     from '../components/companies/CompanyForm'
import CompanyCard     from '../components/companies/CompanyCard'
import API             from '../api/axios'
import useAuth         from '../hooks/useAuth'
import '../styles/companies.css'

// Pipeline columns in order
const STATUSES = [
  { key: 'Applied',    label: 'Applied',    icon: '📨', color: 'var(--secondary-color)' },
  { key: 'OA Cleared',  label: 'OA Cleared',  icon: '✅', color: 'var(--warning-color)'   },
  { key: 'Interview',   label: 'Interview',   icon: '🎤', color: 'var(--primary-color)'   },
  { key: 'HR Round',    label: 'HR Round',    icon: '🤝', color: 'var(--medium-color)'    },
  { key: 'Selected',    label: 'Selected',    icon: '🎉', color: 'var(--success-color)'   },
  { key: 'Rejected',    label: 'Rejected',    icon: '❌', color: 'var(--danger-color)'    },
]

const Companies = () => {

  const { token, loading: authLoading } = useAuth()

  const [companies,   setCompanies]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editCompany, setEditCompany] = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)
  const [dragOverCol, setDragOverCol] = useState(null)

  // ─────────────────────────────────────────
  // FETCH COMPANIES
  // ─────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await API.get('/companies')
      setCompanies(response.data.companies || [])
    } catch (err) {
      console.error('Fetch Companies Error:', err)
      setError('Failed to load applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && token) {
      fetchCompanies()
    }
  }, [fetchCompanies, authLoading, token])

  // ─────────────────────────────────────────
  // GROUP COMPANIES BY STATUS
  // ─────────────────────────────────────────
  const getColumnCompanies = (status) => {
    return companies.filter(c => c.status === status)
  }

  // ─────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────
  const handleAddClick = () => {
    setEditCompany(null)
    setShowForm(true)
  }

  const handleEditClick = (company) => {
    setEditCompany(company)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditCompany(null)
  }

  const handleFormSave = () => {
    fetchCompanies()
  }

  // ─────────────────────────────────────────
  // DELETE HANDLERS
  // ─────────────────────────────────────────
  const handleDeleteClick  = (id) => setDeleteId(id)
  const handleDeleteCancel = ()   => setDeleteId(null)

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await API.delete(`/companies/${deleteId}`)
      setDeleteId(null)
      fetchCompanies()
    } catch (err) {
      setError('Failed to delete application.')
    } finally {
      setDeleting(false)
    }
  }

  // ─────────────────────────────────────────
  // DRAG AND DROP HANDLERS
  // ─────────────────────────────────────────
  const handleDragStart = (e, company) => {
    e.dataTransfer.setData('companyId', company._id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, statusKey) => {
    e.preventDefault()
    setDragOverCol(statusKey)
  }

  const handleDragLeave = () => {
    setDragOverCol(null)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverCol(null)

    const companyId = e.dataTransfer.getData('companyId')
    const company    = companies.find(c => c._id === companyId)

    // No change needed if dropped in same column
    if (!company || company.status === newStatus) return

    // Optimistic UI update — instant feedback
    setCompanies(prev =>
      prev.map(c =>
        c._id === companyId ? { ...c, status: newStatus } : c
      )
    )

    try {
      await API.patch(`/companies/${companyId}/status`, {
        status: newStatus
      })
    } catch (err) {
      console.error('Status Update Error:', err)
      setError('Failed to update status. Reverting.')
      fetchCompanies()   // Revert on failure
    }
  }

  // ─────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────
  const totalApps    = companies.length
  const activeApps   = companies.filter(c =>
    !['Selected', 'Rejected'].includes(c.status)
  ).length
  const selectedApps = companies.filter(c => c.status === 'Selected').length

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Company Applications</h2>
            <p>Track your job applications through every stage</p>
          </div>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Application
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="problems-stats">
        <div className="pstat-card">
          <span className="pstat-value">{totalApps}</span>
          <span className="pstat-label">Total</span>
        </div>
        <div className="pstat-card">
          <span className="pstat-value" style={{ color: 'var(--primary-color)' }}>
            {activeApps}
          </span>
          <span className="pstat-label">Active</span>
        </div>
        <div className="pstat-card">
          <span className="pstat-value" style={{ color: 'var(--success-color)' }}>
            {selectedApps}
          </span>
          <span className="pstat-label">Selected</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading applications...</h3>
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3>No applications yet</h3>
          <p>Start tracking your job applications to see them here</p>
          <button className="btn-primary" onClick={handleAddClick}>
            ➕ Add Application
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {STATUSES.map(({ key, label, icon, color }) => {
            const columnCompanies = getColumnCompanies(key)
            return (
              <div
                key={key}
                className={`kanban-column ${dragOverCol === key ? 'kanban-column-dragover' : ''}`}
                onDragOver={(e) => handleDragOver(e, key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, key)}
              >
                {/* Column Header */}
                <div className="kanban-column-header">
                  <span
                    className="kanban-column-dot"
                    style={{ backgroundColor: color }}
                  />
                  <span className="kanban-column-title">
                    {icon} {label}
                  </span>
                  <span className="kanban-column-count">
                    {columnCompanies.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="kanban-column-body">
                  {columnCompanies.length === 0 ? (
                    <div className="kanban-empty">
                      Drop here
                    </div>
                  ) : (
                    columnCompanies.map(company => (
                      <CompanyCard
                        key={company._id}
                        company={company}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <CompanyForm
          company={editCompany}
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
              <h2 className="modal-title">🗑️ Delete Application</h2>
              <button className="modal-close" onClick={handleDeleteCancel}>✕</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Are you sure you want to delete this application?
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

export default Companies
