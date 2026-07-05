// ============================================
// StreakCard.jsx — Streak Display Card
// Shows current and longest streak
// ============================================

import { formatDate } from '../../utils/helpers'

const StreakCard = ({
  currentStreak,
  longestStreak,
  lastSolvedDate
}) => {

  // Determine streak status message
  const getStreakMessage = () => {
    if (!lastSolvedDate)    return 'Start solving to build your streak!'
    if (currentStreak === 0) return 'Streak broken — solve today to restart!'
    if (currentStreak === 1) return 'Great start — keep going tomorrow!'
    if (currentStreak < 7)  return `${currentStreak} days strong — keep it up!`
    if (currentStreak < 30) return `Amazing — ${currentStreak} day streak!`
    return `Incredible — ${currentStreak} day streak! 🔥`
  }

  // Flame color based on streak length
  const getFlameColor = () => {
    if (currentStreak === 0) return 'var(--text-muted)'
    if (currentStreak < 7)  return 'var(--warning-color)'
    if (currentStreak < 30) return 'var(--medium-color)'
    return 'var(--danger-color)'
  }

  return (
    <div className="streak-card">

      {/* Flame Icon */}
      <div className="streak-icon" style={{ color: getFlameColor() }}>
        🔥
      </div>

      {/* Streak Info */}
      <div className="streak-info">
        <div className="streak-current">
          <span
            className="streak-number"
            style={{ color: getFlameColor() }}
          >
            {currentStreak}
          </span>
          <span className="streak-label">Day Streak</span>
        </div>

        <p className="streak-message">{getStreakMessage()}</p>

        {/* Stats Row */}
        <div className="streak-stats">
          <div className="streak-stat">
            <span className="streak-stat-value">{longestStreak}</span>
            <span className="streak-stat-label">Longest</span>
          </div>
          <div className="streak-stat-divider" />
          <div className="streak-stat">
            <span className="streak-stat-value">
              {lastSolvedDate ? formatDate(lastSolvedDate) : 'Never'}
            </span>
            <span className="streak-stat-label">Last Solved</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default StreakCard