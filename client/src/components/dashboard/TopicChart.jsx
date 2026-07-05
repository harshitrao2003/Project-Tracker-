// ============================================
// TopicChart.jsx — Topic Distribution Pie Chart
// Shows problems solved per topic as a pie
// ============================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

import ChartWrapper from './ChartWrapper'

// ─────────────────────────────────────────
// Color palette for pie slices
// Cycles through if more topics than colors
// ─────────────────────────────────────────
const COLORS = [
  '#6c63ff', // primary
  '#03dac6', // secondary
  '#ff9800', // warning
  '#4caf50', // success
  '#f44336', // danger
  '#9c27b0', // purple
  '#2196f3', // blue
  '#ffc107', // amber
  '#00bcd4', // cyan
  '#e91e63', // pink
]

// ─────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{data.topic}</p>
        <p className="custom-tooltip-value">
          {data.solved} solved
        </p>
        <p className="custom-tooltip-sub">
          {data.total} total added
        </p>
      </div>
    )
  }
  return null
}

// ─────────────────────────────────────────
// Custom Legend
// Recharts default legend doesn't wrap nicely
// so we build our own below the chart
// ─────────────────────────────────────────
const CustomLegend = ({ data }) => {
  return (
    <div className="chart-legend">
      {data.map((entry, index) => (
        <div key={entry.topic} className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span>{entry.topic} ({entry.solved})</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// TopicChart Props
// data → array from stats API topicStats
// ─────────────────────────────────────────
const TopicChart = ({ data = [], loading, error }) => {

  // Only show topics with at least 1 solved problem
  const chartData = data.filter(t => t.solved > 0)

  const hasData = chartData.length > 0

  return (
    <ChartWrapper
      title="📊 Topic Distribution"
      subtitle="Solved problems by topic"
      loading={loading}
      error={error}
      isEmpty={!hasData}
      emptyMessage="Solve some problems to see topic distribution"
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="solved"
            nameKey="topic"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            label={({ percent }) =>
              percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="var(--card-color)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend below chart */}
      {hasData && <CustomLegend data={chartData} />}
    </ChartWrapper>
  )
}

export default TopicChart