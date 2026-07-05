// ============================================
// ProgressBar.jsx — Reusable Progress Bar
// Used in Progress page and Dashboard
// ============================================

const ProgressBar = ({
  label,
  solved,
  total,
  color = 'var(--primary-color)',
  showPercent = true
}) => {

  // Calculate percentage safely
  const percent = total > 0
    ? Math.round((solved / total) * 100)
    : 0

  return (
    <div className="progress-item">

      {/* Label Row */}
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <div className="progress-counts">
          {showPercent && (
            <span
              className="progress-percent"
              style={{ color }}
            >
              {percent}%
            </span>
          )}
          <span className="progress-fraction">
            {solved}/{total}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width:           `${percent}%`,
            backgroundColor: color
          }}
        />
      </div>

    </div>
  )
}

export default ProgressBar