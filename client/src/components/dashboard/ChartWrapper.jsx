// ============================================
// ChartWrapper.jsx
// Reusable wrapper for all Recharts charts
// Handles loading, empty, and error states
// Provides consistent card styling
// ============================================

import Loader from '../common/Loader'

const ChartWrapper = ({
  title,
  subtitle,
  loading,
  error,
  isEmpty,
  emptyMessage = 'No data available yet',
  children,
  height = 300
}) => {
  return (
    <div className="chart-card">

      {/* Header */}
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {subtitle && (
            <p className="chart-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="chart-body"
        style={{ height: `${height}px` }}
      >
        {loading ? (
          <div className="chart-state">
            <Loader size="sm" text="Loading chart..." full={false} />
          </div>
        ) : error ? (
          <div className="chart-state">
            <span className="chart-state-icon">⚠️</span>
            <p className="chart-state-text">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="chart-state">
            <span className="chart-state-icon">📊</span>
            <p className="chart-state-text">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>

    </div>
  )
}

export default ChartWrapper