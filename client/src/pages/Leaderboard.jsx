// ============================================
// Leaderboard.jsx — Public Rankings Page
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/common/DashboardLayout'
import API             from '../api/axios'
import useAuth         from '../hooks/useAuth'
import '../styles/leaderboard.css'

const Leaderboard = () => {

  const { user } = useAuth()

  const [leaderboard, setLeaderboard] = useState([])
  const [colleges,    setColleges]    = useState([])
  const [branches,    setBranches]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  const [filterCollege, setFilterCollege] = useState('All')
  const [filterBranch,  setFilterBranch]  = useState('All')

  // ─────────────────────────────────────────
  // FETCH LEADERBOARD + FILTERS
  // ─────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (filterCollege !== 'All') params.append('college', filterCollege)
      if (filterBranch  !== 'All') params.append('branch',  filterBranch)

      const [lbRes, collegesRes, branchesRes] = await Promise.all([
        API.get(`/leaderboard?${params.toString()}`),
        API.get('/leaderboard/colleges'),
        API.get('/leaderboard/branches')
      ])

      setLeaderboard(lbRes.data.leaderboard || [])
      setColleges(collegesRes.data.colleges  || [])
      setBranches(branchesRes.data.branches  || [])

    } catch (err) {
      console.error('Leaderboard Error:', err)
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [filterCollege, filterBranch])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // ─────────────────────────────────────────
  // RANK BADGE
  // ─────────────────────────────────────────
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  // ─────────────────────────────────────────
  // CHECK IF CURRENT USER
  // ─────────────────────────────────────────
  const isCurrentUser = (entry) => {
    return user && entry.userId?.toString() === user.id?.toString()
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
            <h2>🏆 Leaderboard</h2>
            <p>See how you rank among your peers</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="leaderboard-podium">
          {/* 2nd Place */}
          <div className="podium-card podium-2">
            <div className="podium-avatar">
              {leaderboard[1].name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-badge">🥈</div>
            <h4 className="podium-name">
              {leaderboard[1].name.split(' ')[0]}
            </h4>
            <p className="podium-college">
              {leaderboard[1].college}
            </p>
            <div className="podium-score">
              {leaderboard[1].totalSolved}
              <span>solved</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="podium-card podium-1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar podium-avatar-1">
              {leaderboard[0].name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-badge">🥇</div>
            <h4 className="podium-name">
              {leaderboard[0].name.split(' ')[0]}
            </h4>
            <p className="podium-college">
              {leaderboard[0].college}
            </p>
            <div className="podium-score">
              {leaderboard[0].totalSolved}
              <span>solved</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="podium-card podium-3">
            <div className="podium-avatar">
              {leaderboard[2].name.charAt(0).toUpperCase()}
            </div>
            <div className="podium-badge">🥉</div>
            <h4 className="podium-name">
              {leaderboard[2].name.split(' ')[0]}
            </h4>
            <p className="podium-college">
              {leaderboard[2].college}
            </p>
            <div className="podium-score">
              {leaderboard[2].totalSolved}
              <span>solved</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="problems-toolbar">
        <select
          className="filter-select"
          value={filterCollege}
          onChange={e => setFilterCollege(e.target.value)}
        >
          <option value="All">All Colleges</option>
          {colleges.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
        >
          <option value="All">All Branches</option>
          {branches.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <button
          className="btn-secondary"
          onClick={() => {
            setFilterCollege('All')
            setFilterBranch('All')
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

      {/* Leaderboard Table */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading leaderboard...</h3>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No users found</h3>
          <p>Try clearing the filters</p>
        </div>
      ) : (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>College</th>
                <th>Branch</th>
                <th>Easy</th>
                <th>Medium</th>
                <th>Hard</th>
                <th>Total</th>
                <th>Streak 🔥</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr
                  key={entry.userId}
                  className={`
                    leaderboard-row
                    ${isCurrentUser(entry) ? 'leaderboard-row-me' : ''}
                    ${entry.rank <= 3 ? `leaderboard-row-top${entry.rank}` : ''}
                  `}
                >
                  {/* Rank */}
                  <td className="leaderboard-rank">
                    <span className="rank-badge">
                      {getRankBadge(entry.rank)}
                    </span>
                  </td>

                  {/* Name */}
                  <td>
                    <div className="leaderboard-user">
                      <div className="leaderboard-avatar">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="leaderboard-name">
                          {entry.name}
                          {isCurrentUser(entry) && (
                            <span className="you-badge">You</span>
                          )}
                        </div>
                        <div className="leaderboard-year">
                          {entry.graduationYear}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td>
                    <span className="leaderboard-college">
                      {entry.college}
                    </span>
                  </td>

                  {/* Branch */}
                  <td>
                    <span className="leaderboard-branch">
                      {entry.branch}
                    </span>
                  </td>

                  {/* Easy */}
                  <td>
                    <span style={{ color: 'var(--easy-color)', fontWeight: 600 }}>
                      {entry.easy}
                    </span>
                  </td>

                  {/* Medium */}
                  <td>
                    <span style={{ color: 'var(--medium-color)', fontWeight: 600 }}>
                      {entry.medium}
                    </span>
                  </td>

                  {/* Hard */}
                  <td>
                    <span style={{ color: 'var(--hard-color)', fontWeight: 600 }}>
                      {entry.hard}
                    </span>
                  </td>

                  {/* Total */}
                  <td>
                    <span className="leaderboard-total">
                      {entry.totalSolved}
                    </span>
                  </td>

                  {/* Streak */}
                  <td>
                    <span className="leaderboard-streak">
                      {entry.currentStreak > 0
                        ? `🔥 ${entry.currentStreak}`
                        : '—'
                      }
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User's Own Rank (if not visible in table) */}
      {!loading && user && leaderboard.length > 0 && (
        (() => {
          const myEntry = leaderboard.find(e => isCurrentUser(e))
          if (!myEntry) return null
          return (
            <div className="my-rank-card">
              <span>Your rank:</span>
              <strong>{getRankBadge(myEntry.rank)}</strong>
              <span>{myEntry.totalSolved} problems solved</span>
              {myEntry.currentStreak > 0 && (
                <span>🔥 {myEntry.currentStreak} day streak</span>
              )}
            </div>
          )
        })()
      )}

    </DashboardLayout>
  )
}

export default Leaderboard
