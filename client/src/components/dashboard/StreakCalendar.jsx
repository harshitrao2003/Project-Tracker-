// ============================================
// StreakCalendar.jsx
// GitHub-style contribution heatmap
// ============================================

import ChartWrapper from './ChartWrapper'

const StreakCalendar = ({ weeklyData = [], loading }) => {

  console.log('🔥 StreakCalendar:', { weeklyData, loading })

  const getIntensity = (count) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3)  return 2
    if (count <= 5)  return 3
    return 4
  }

  const intensityColors = [
    'var(--border-color)',
    'rgba(108, 99, 255, 0.3)',
    'rgba(108, 99, 255, 0.55)',
    'rgba(108, 99, 255, 0.8)',
    'var(--primary-color)',
  ]

  const hasData = weeklyData && weeklyData.length > 0 && weeklyData.some(d => d.count > 0)

  return (
    <ChartWrapper
      title="🔥 Activity Calendar"
      subtitle="Last 7 days of solving activity"
      loading={loading}
      error={null}
      isEmpty={!hasData}
      emptyMessage="No activity yet — start solving!"
      height={140}
    >
      {weeklyData && weeklyData.length > 0 && (
        <>
          <div className="streak-calendar">
            {weeklyData.map((day, index) => {
              const intensity = getIntensity(day.count)
              return (
                <div
                  key={index}
                  className="streak-calendar-cell"
                  style={{
                    backgroundColor: intensityColors[intensity]
                  }}
                  title={`${day.day}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
                >
                  <span className="streak-calendar-day">{day.day}</span>
                  <span className="streak-calendar-count">
                    {day.count > 0 ? day.count : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="streak-calendar-legend">
            <span>Less</span>
            {intensityColors.map((color, i) => (
              <span
                key={i}
                className="streak-legend-box"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </ChartWrapper>
  )
}

export default StreakCalendar