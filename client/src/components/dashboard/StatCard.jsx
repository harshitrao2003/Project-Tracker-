// ============================================
// StatCard.jsx — Reusable Statistics Card
// Used on Dashboard to show key metrics
// ============================================

const StatCard = ({
  icon,
  label,
  value,
  color,
  subLabel,
  subValue
}) => {
  return (
    <div className="stat-card">

      {/* Icon Box */}
      <div
        className="stat-card-icon"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>

      {/* Info */}
      <div className="stat-card-info">
        <div
          className="stat-card-value"
          style={{ color }}
        >
          {value ?? 0}
        </div>
        <div className="stat-card-label">{label}</div>

        {/* Optional sub info */}
        {subLabel && (
          <div className="stat-card-sub">
            {subLabel}: <strong>{subValue ?? 0}</strong>
          </div>
        )}
      </div>

    </div>
  )
}

export default StatCard