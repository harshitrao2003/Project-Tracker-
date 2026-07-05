// ============================================
// Dashboard.jsx — Main Dashboard Page
// ============================================
import TopicChart from '../components/dashboard/TopicChart'
import { useState, useEffect, useCallback } from 'react'
import { Link }                             from 'react-router-dom'
import DashboardLayout                      from '../components/common/DashboardLayout'
import StatCard                             from '../components/dashboard/StatCard'
import StreakCard                           from '../components/dashboard/StreakCard'
import WeeklyChart                          from '../components/dashboard/WeeklyChart'
import API                                 from '../api/axios'
import useAuth                             from '../hooks/useAuth'
import { formatDate }                      from '../utils/helpers'
import '../styles/dashboard.css'
import StreakCalendar from '../components/dashboard/StreakCalendar'

const Dashboard = () => {

  const { user, token, loading: authLoading } = useAuth()

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [stats,        setStats]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [chartLoading, setChartLoading] = useState(true)

  // ─────────────────────────────────────────
  // FETCH STATS
  // ─────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setChartLoading(true)
      setError('')

      const response = await API.get('/problems/stats')
      setStats(response.data.stats)

    } catch (err) {
      console.error('Fetch Stats Error:', err)
      setError('Failed to load dashboard stats.')
    } finally {
      setLoading(false)
      setChartLoading(false)
    }
  }, [])

  // Wait for auth then fetch
  useEffect(() => {
    if (!authLoading && token) {
      fetchStats()
    }
  }, [fetchStats, authLoading, token])

  // ─────────────────────────────────────────
  // GREETING
  // ─────────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ─── Welcome Header ─── */}
      <div className="dashboard-welcome">
        <div>
          <h2>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p>
            Here is your placement preparation summary.
            {stats?.lastSolvedDate && (
              <span style={{ color: 'var(--text-muted)' }}>
                {' '}Last active: {formatDate(stats.lastSolvedDate)}
              </span>
            )}
          </p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month:   'long',
            day:     'numeric'
          })}
        </div>
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div className="dashboard-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchStats}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <p>Loading your stats...</p>
        </div>
      ) : (
        <>
          {/* ─── Stats Cards ─── */}
          <div className="stats-grid">
            <StatCard
              icon="💻"
              label="Total Solved"
              value={stats?.totalSolved}
              color="var(--primary-color)"
              subLabel="Total Added"
              subValue={stats?.totalProblems}
            />
            <StatCard
              icon="🟢"
              label="Easy Solved"
              value={stats?.easy}
              color="var(--easy-color)"
            />
            <StatCard
              icon="🟡"
              label="Medium Solved"
              value={stats?.medium}
              color="var(--medium-color)"
            />
            <StatCard
              icon="🔴"
              label="Hard Solved"
              value={stats?.hard}
              color="var(--hard-color)"
            />
          </div>

         {/* ─── Streak Card ─── */}
<div style={{ marginBottom: '1.5rem' }}>
  <StreakCard
    currentStreak={stats?.currentStreak  || 0}
    longestStreak={stats?.longestStreak  || 0}
    lastSolvedDate={stats?.lastSolvedDate || null}
  />
</div>

{/* ─── Streak Calendar ─── */}
<div style={{ marginBottom: '1.5rem' }}>
  <StreakCalendar
    weeklyData={stats?.weeklyStats || []}
    loading={chartLoading}
  />
</div>

         {/* ─── Charts Grid — Weekly + Topic Distribution ─── */}
<div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
  <WeeklyChart
    data={stats?.weeklyStats || []}
    loading={chartLoading}
    error={null}
  />
  <TopicChart
    data={stats?.topicStats || []}
    loading={chartLoading}
    error={null}
  />
</div>

          {/* ─── Module Summary ─── */}
          <h3 className="dashboard-section-title">
            📋 Module Overview
          </h3>
          <div className="dashboard-modules">

            <Link to="/problems" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(108,99,255,0.1)' }}
              >
                💻
              </div>
              <div className="module-card-info">
                <h4>Problems</h4>
                <p>{stats?.totalSolved || 0} solved</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

            <Link to="/progress" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(3,218,198,0.1)' }}
              >
                📈
              </div>
              <div className="module-card-info">
                <h4>Progress</h4>
                <p>Topic wise tracking</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

            <Link to="/companies" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(3,218,198,0.1)' }}
              >
                🏢
              </div>
              <div className="module-card-info">
                <h4>Companies</h4>
                <p>Track applications</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

            <Link to="/resumes" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(255,152,0,0.1)' }}
              >
                📄
              </div>
              <div className="module-card-info">
                <h4>Resumes</h4>
                <p>Manage versions</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

            <Link to="/interviews" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(76,175,80,0.1)' }}
              >
                🎤
              </div>
              <div className="module-card-info">
                <h4>Interviews</h4>
                <p>Mock sessions</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

            <Link to="/leaderboard" className="module-card">
              <div
                className="module-card-icon"
                style={{ backgroundColor: 'rgba(244,67,54,0.1)' }}
              >
                🏆
              </div>
              <div className="module-card-info">
                <h4>Leaderboard</h4>
                <p>Compare rankings</p>
              </div>
              <span className="module-card-arrow">→</span>
            </Link>

          </div>

          {/* ─── Topic Progress Preview ─── */}
          {stats?.topicStats?.length > 0 && (
            <>
              <h3 className="dashboard-section-title">
                📊 Topic Progress
              </h3>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                {stats.topicStats.slice(0, 5).map(topic => (
                  <div key={topic.topic} className="topic-progress-row">
                    <div className="topic-progress-info">
                      <span className="topic-name">{topic.topic}</span>
                      <span className="topic-count">
                        {topic.solved}/{topic.total}
                      </span>
                    </div>
                    <div className="topic-progress-bar">
                      <div
                        className="topic-progress-fill"
                        style={{
                          width: topic.total > 0
                            ? `${Math.round(
                                (topic.solved / topic.total) * 100
                              )}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                ))}
                {stats.topicStats.length > 5 && (
                  <Link to="/progress" className="view-all-link">
                    View all topics →
                  </Link>
                )}
              </div>
            </>
          )}

        </>
      )}

    </DashboardLayout>
  )
}

export default Dashboard