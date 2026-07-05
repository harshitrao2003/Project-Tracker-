// ============================================
// Progress.jsx — Topic-wise Progress Page
// Shows progress bars for each DSA topic
// ============================================

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/common/DashboardLayout'
import ProgressBar     from '../components/dashboard/ProgressBar'
import API             from '../api/axios'
import useAuth         from '../hooks/useAuth'
import '../styles/progress.css'

// Topic target goals
// How many problems ideally per topic
const TOPIC_GOALS = {
  'Arrays':                75,
  'Strings':               50,
  'Linked List':           30,
  'Stack':                 25,
  'Queue':                 20,
  'Trees':                 40,
  'Graphs':                35,
  'Dynamic Programming':   50,
  'Recursion':             25,
  'Backtracking':          20,
  'Binary Search':         30,
  'Sorting':               20,
  'Hashing':               25,
  'Greedy':                25,
  'Math':                  20,
  'Two Pointers':          25,
  'Sliding Window':        20,
  'Heap':                  20,
  'Trie':                  15,
  'Bit Manipulation':      15,
  'Other':                 20
}

// Color per difficulty
const DIFFICULTY_COLORS = {
  Easy:   'var(--easy-color)',
  Medium: 'var(--medium-color)',
  Hard:   'var(--hard-color)'
}

const Progress = () => {

  const { token, loading: authLoading } = useAuth()

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [sortBy,  setSortBy]  = useState('solved')

  // ─────────────────────────────────────────
  // FETCH STATS
  // ─────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await API.get('/problems/stats')
      setStats(response.data.stats)

    } catch (err) {
      console.error('Fetch Progress Error:', err)
      setError('Failed to load progress data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && token) {
      fetchStats()
    }
  }, [fetchStats, authLoading, token])

  // ─────────────────────────────────────────
  // SORT TOPIC STATS
  // ─────────────────────────────────────────
  const getSortedTopics = () => {
    if (!stats?.topicStats) return []

    const topics = [...stats.topicStats]

    switch (sortBy) {
      case 'solved':
        // Most solved first
        return topics.sort((a, b) => b.solved - a.solved)
      case 'percent':
        // Highest completion % first
        return topics.sort((a, b) => {
          const pA = a.total > 0 ? a.solved / a.total : 0
          const pB = b.total > 0 ? b.solved / b.total : 0
          return pB - pA
        })
      case 'total':
        // Most total problems first
        return topics.sort((a, b) => b.total - a.total)
      case 'name':
        // Alphabetical
        return topics.sort((a, b) =>
          a.topic.localeCompare(b.topic)
        )
      default:
        return topics
    }
  }

  // ─────────────────────────────────────────
  // OVERALL PROGRESS
  // ─────────────────────────────────────────
  const overallPercent = stats
    ? stats.totalProblems > 0
      ? Math.round((stats.totalSolved / stats.totalProblems) * 100)
      : 0
    : 0

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Progress Tracker</h2>
            <p>Track your topic-wise DSA progress</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="progress-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchStats}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="progress-loading">
          <div className="progress-loader"></div>
          <p>Loading progress...</p>
        </div>
      ) : (
        <>
          {/* ─── Overall Progress ─── */}
          <div className="overall-progress-card">
            <div className="overall-progress-info">
              <div>
                <h3>Overall Progress</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {stats?.totalSolved || 0} solved out of {stats?.totalProblems || 0} total problems
                </p>
              </div>
              <div
                className="overall-percent"
                style={{ color: 'var(--primary-color)' }}
              >
                {overallPercent}%
              </div>
            </div>
            <div className="overall-progress-bar">
              <div
                className="overall-progress-fill"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            {/* Difficulty Breakdown */}
            <div className="difficulty-breakdown">
              {['easy', 'medium', 'hard'].map(level => (
                <div key={level} className="difficulty-item">
                  <span
                    className="difficulty-dot"
                    style={{
                      backgroundColor: DIFFICULTY_COLORS[
                        level.charAt(0).toUpperCase() + level.slice(1)
                      ]
                    }}
                  />
                  <span className="difficulty-item-label">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                  <span className="difficulty-item-count">
                    {stats?.[level] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Streak Summary ─── */}
          <div className="progress-streak-row">
            <div className="progress-streak-card">
              <span className="progress-streak-icon">🔥</span>
              <div>
                <div className="progress-streak-value">
                  {stats?.currentStreak || 0}
                </div>
                <div className="progress-streak-label">Current Streak</div>
              </div>
            </div>
            <div className="progress-streak-card">
              <span className="progress-streak-icon">⭐</span>
              <div>
                <div className="progress-streak-value">
                  {stats?.longestStreak || 0}
                </div>
                <div className="progress-streak-label">Longest Streak</div>
              </div>
            </div>
            <div className="progress-streak-card">
              <span className="progress-streak-icon">📅</span>
              <div>
                <div className="progress-streak-value">
                  {stats?.weeklyStats?.reduce((sum, d) => sum + d.count, 0) || 0}
                </div>
                <div className="progress-streak-label">This Week</div>
              </div>
            </div>
          </div>

          {/* ─── Topic Progress ─── */}
          {stats?.topicStats?.length > 0 ? (
            <div className="topic-progress-card">

              {/* Header with sort */}
              <div className="topic-progress-header">
                <h3>Topic-wise Progress</h3>
                <div className="sort-controls">
                  <span className="sort-label">Sort by:</span>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="solved">Most Solved</option>
                    <option value="percent">% Complete</option>
                    <option value="total">Most Added</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="progress-bars-list">
                {getSortedTopics().map(topic => {

                  // Pick color based on completion
                  const percent = topic.total > 0
                    ? (topic.solved / topic.total) * 100
                    : 0

                  const color = percent >= 70
                    ? 'var(--easy-color)'
                    : percent >= 40
                    ? 'var(--medium-color)'
                    : 'var(--primary-color)'

                  return (
                    <ProgressBar
                      key={topic.topic}
                      label={topic.topic}
                      solved={topic.solved}
                      total={topic.total}
                      color={color}
                      showPercent={true}
                    />
                  )
                })}
              </div>

            </div>
          ) : (
            <div className="progress-empty">
              <div className="progress-empty-icon">📊</div>
              <h3>No progress data yet</h3>
              <p>Start adding and solving problems to see your progress here.</p>
            </div>
          )}

          {/* ─── Platform Stats ─── */}
          {stats?.platformStats?.length > 0 && (
            <div className="platform-stats-card">
              <h3>Platform Breakdown</h3>
              <div className="platform-grid">
                {stats.platformStats.map(p => (
                  <div key={p.platform} className="platform-item">
                    <div className="platform-name">{p.platform}</div>
                    <div className="platform-counts">
                      <span
                        className="platform-solved"
                        style={{ color: 'var(--success-color)' }}
                      >
                        {p.solved} solved
                      </span>
                      <span className="platform-total">
                        / {p.total} total
                      </span>
                    </div>
                    <ProgressBar
                      label=""
                      solved={p.solved}
                      total={p.total}
                      color="var(--secondary-color)"
                      showPercent={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

    </DashboardLayout>
  )
}

export default Progress