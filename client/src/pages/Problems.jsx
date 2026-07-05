// ============================================
// Problems.jsx — Problem Tracker Page
// With debounced search + persistent filters
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout  from '../components/common/DashboardLayout'
import ProblemForm      from '../components/problems/ProblemForm'
import API              from '../api/axios'
import useAuth          from '../hooks/useAuth'
import useDebounce      from '../hooks/useDebounce'
import useLocalStorage  from '../hooks/useLocalStorage'
import { formatDate }   from '../utils/helpers'
import '../styles/problems.css'

const TOPICS = [
  'All', 'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion',
  'Backtracking', 'Binary Search', 'Sorting', 'Hashing',
  'Greedy', 'Math', 'Two Pointers', 'Sliding Window',
  'Heap', 'Trie', 'Bit Manipulation', 'Other'
]

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']
const PLATFORMS    = [
  'All', 'LeetCode', 'GeeksforGeeks', 'HackerRank',
  'CodeChef', 'Codeforces', 'InterviewBit', 'HackerEarth', 'Other'
]
const SOLVED = ['All', 'Solved', 'Unsolved']

// Default filter values
const DEFAULT_FILTERS = {
  search:     '',
  topic:      'All',
  difficulty: 'All',
  platform:   'All',
  solved:     'All'
}

const Problems = () => {

  // ─────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────
  const { token, loading: authLoading } = useAuth()

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [problems,    setProblems]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editProblem, setEditProblem] = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)

  // ─────────────────────────────────────────
  // PERSISTENT FILTERS
  // Saved to localStorage so they survive
  // page navigation
  // ─────────────────────────────────────────
  const [filters, setFilters] = useLocalStorage(
    'problems_filters',
    DEFAULT_FILTERS
  )

  // Search text tracked separately for debouncing
  const [searchText, setSearchText] = useState(filters.search || '')

  // Debounced search — waits 400ms after
  // user stops typing before updating filter
  const debouncedSearch = useDebounce(searchText, 400)

  // Sync debounced search into filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  // ─────────────────────────────────────────
  // COUNT ACTIVE FILTERS
  // Shows badge on clear button
  // ─────────────────────────────────────────
  const activeFilterCount = [
    filters.search     !== ''    ? 1 : 0,
    filters.topic      !== 'All' ? 1 : 0,
    filters.difficulty !== 'All' ? 1 : 0,
    filters.platform   !== 'All' ? 1 : 0,
    filters.solved     !== 'All' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  // ─────────────────────────────────────────
  // FETCH PROBLEMS
  // ─────────────────────────────────────────
  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()

      if (filters.search)                    params.append('search',     filters.search)
      if (filters.topic      !== 'All')      params.append('topic',      filters.topic)
      if (filters.difficulty !== 'All')      params.append('difficulty', filters.difficulty)
      if (filters.platform   !== 'All')      params.append('platform',   filters.platform)
      if (filters.solved     === 'Solved')   params.append('solved',     'true')
      if (filters.solved     === 'Unsolved') params.append('solved',     'false')

      const response = await API.get(`/problems?${params.toString()}`)
      setProblems(response.data.problems || [])

    } catch (err) {
      console.error('Fetch Problems Error:', err)
      setError('Failed to load problems. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Wait for auth then fetch
  useEffect(() => {
    if (!authLoading && token) {
      fetchProblems()
    }
  }, [fetchProblems, authLoading, token])

  // ─────────────────────────────────────────
  // FILTER HANDLERS
  // ─────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    // Search handled separately via debounce
    if (name === 'search') {
      setSearchText(value)
    } else {
      setFilters(prev => ({ ...prev, [name]: value }))
    }
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchText('')
  }

  // ─────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────
  const handleAddClick = () => {
    setEditProblem(null)
    setShowForm(true)
  }

  const handleEditClick = (problem) => {
    setEditProblem(problem)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditProblem(null)
  }

  const handleFormSave = () => {
    fetchProblems()
  }

  // ─────────────────────────────────────────
  // DELETE HANDLERS
  // ─────────────────────────────────────────
  const handleDeleteClick    = (id) => setDeleteId(id)
  const handleDeleteCancel   = ()   => setDeleteId(null)

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await API.delete(`/problems/${deleteId}`)
      setDeleteId(null)
      fetchProblems()
    } catch (err) {
      setError('Failed to delete problem.')
    } finally {
      setDeleting(false)
    }
  }

  // ─────────────────────────────────────────
  // TOGGLE SOLVED
  // ─────────────────────────────────────────
  const handleToggleSolved = async (problem) => {
    try {
      await API.put(`/problems/${problem._id}`, {
        solved: !problem.solved
      })
      fetchProblems()
    } catch (err) {
      setError('Failed to update problem.')
    }
  }

  // ─────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────
  const totalProblems  = problems.length
  const solvedProblems = problems.filter(p => p.solved).length
  const easyCount      = problems.filter(p => p.difficulty === 'Easy'   && p.solved).length
  const mediumCount    = problems.filter(p => p.difficulty === 'Medium' && p.solved).length
  const hardCount      = problems.filter(p => p.difficulty === 'Hard'   && p.solved).length

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Problem Tracker</h2>
            <p>Track and manage your DSA practice problems</p>
          </div>
          <button
            className="btn-primary"
            onClick={handleAddClick}
          >
            ➕ Add Problem
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="problems-stats">
        <div className="pstat-card">
          <span className="pstat-value">{totalProblems}</span>
          <span className="pstat-label">Total</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--success-color)' }}
          >
            {solvedProblems}
          </span>
          <span className="pstat-label">Solved</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--easy-color)' }}
          >
            {easyCount}
          </span>
          <span className="pstat-label">Easy</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--medium-color)' }}
          >
            {mediumCount}
          </span>
          <span className="pstat-label">Medium</span>
        </div>
        <div className="pstat-card">
          <span
            className="pstat-value"
            style={{ color: 'var(--hard-color)' }}
          >
            {hardCount}
          </span>
          <span className="pstat-label">Hard</span>
        </div>
      </div>

      {/* Toolbar — Search + Filters */}
      <div className="problems-toolbar">

        {/* Search with debounce */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            name="search"
            className="search-input"
            placeholder="Search problems..."
            value={searchText}
            onChange={handleFilterChange}
          />
          {/* Show spinner while debounce delay is active */}
          {searchText !== filters.search && (
            <span className="search-loading">⏳</span>
          )}
        </div>

        {/* Topic Filter */}
        <select
          name="topic"
          className="filter-select"
          value={filters.topic}
          onChange={handleFilterChange}
        >
          {TOPICS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          name="difficulty"
          className="filter-select"
          value={filters.difficulty}
          onChange={handleFilterChange}
        >
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Platform Filter */}
        <select
          name="platform"
          className="filter-select"
          value={filters.platform}
          onChange={handleFilterChange}
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Solved Filter */}
        <select
          name="solved"
          className="filter-select"
          value={filters.solved}
          onChange={handleFilterChange}
        >
          {SOLVED.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Clear Filters with badge */}
        <button
          className="btn-secondary filter-clear-btn"
          onClick={clearFilters}
        >
          Clear
          {activeFilterCount > 0 && (
            <span className="filter-badge">
              {activeFilterCount}
            </span>
          )}
        </button>

      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {filters.search && (
            <span className="filter-tag">
              Search: "{filters.search}"
              <button onClick={() => {
                setSearchText('')
                setFilters(prev => ({ ...prev, search: '' }))
              }}>✕</button>
            </span>
          )}
          {filters.topic !== 'All' && (
            <span className="filter-tag">
              Topic: {filters.topic}
              <button onClick={() =>
                setFilters(prev => ({ ...prev, topic: 'All' }))
              }>✕</button>
            </span>
          )}
          {filters.difficulty !== 'All' && (
            <span className="filter-tag">
              Difficulty: {filters.difficulty}
              <button onClick={() =>
                setFilters(prev => ({ ...prev, difficulty: 'All' }))
              }>✕</button>
            </span>
          )}
          {filters.platform !== 'All' && (
            <span className="filter-tag">
              Platform: {filters.platform}
              <button onClick={() =>
                setFilters(prev => ({ ...prev, platform: 'All' }))
              }>✕</button>
            </span>
          )}
          {filters.solved !== 'All' && (
            <span className="filter-tag">
              Status: {filters.solved}
              <button onClick={() =>
                setFilters(prev => ({ ...prev, solved: 'All' }))
              }>✕</button>
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="form-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Problems Table */}
      <div className="problems-table-wrapper">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading problems...</h3>
          </div>
        ) : problems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💻</div>
            <h3>No problems found</h3>
            <p>
              {activeFilterCount > 0
                ? 'Try clearing some filters'
                : 'Add your first DSA problem to get started'
              }
            </p>
            {activeFilterCount > 0 ? (
              <button className="btn-secondary" onClick={clearFilters}>
                Clear All Filters
              </button>
            ) : (
              <button className="btn-primary" onClick={handleAddClick}>
                ➕ Add Problem
              </button>
            )}
          </div>
        ) : (
          <table className="problems-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr key={problem._id}>

                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>
                    {index + 1}
                  </td>

                  <td className="problem-title">
                    {problem.problemUrl ? (
                      <a
                        href={problem.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {problem.title}
                      </a>
                    ) : (
                      problem.title
                    )}
                  </td>

                  <td>
                    <span style={{
                      color:    'var(--text-muted)',
                      fontSize: '0.8rem'
                    }}>
                      {problem.topic}
                    </span>
                  </td>

                  <td>
                    <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      color:    'var(--text-muted)',
                      fontSize: '0.8rem'
                    }}>
                      {problem.platform}
                    </span>
                  </td>

                  <td>
                    <button
                      className={`solved-badge ${problem.solved ? 'solved-yes' : 'solved-no'}`}
                      onClick={() => handleToggleSolved(problem)}
                      title="Click to toggle"
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {problem.solved ? '✅ Solved' : '⏳ Unsolved'}
                    </button>
                  </td>

                  <td style={{
                    color:    'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}>
                    {problem.solved && problem.solvedDate
                      ? formatDate(problem.solvedDate)
                      : '—'
                    }
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditClick(problem)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDeleteClick(problem._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && problems.length > 0 && (
        <div className="problems-footer">
          Showing <strong>{problems.length}</strong> problem{problems.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' '}(filtered)
            </span>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <ProblemForm
          problem={editProblem}
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
              <h2 className="modal-title">🗑️ Delete Problem</h2>
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
                Are you sure you want to delete this problem?
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

export default Problems