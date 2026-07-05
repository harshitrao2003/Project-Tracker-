// ============================================
// WeeklyChart.jsx — Weekly Solved Bar Chart
// Shows problems solved per day — last 7 days
// ============================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

import ChartWrapper from './ChartWrapper'

// ─────────────────────────────────────────
// Custom Tooltip Component
// Shows on hover over each bar
// ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{label}</p>
        <p className="custom-tooltip-value">
          {payload[0].value} problem{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  return null
}

// ─────────────────────────────────────────
// WeeklyChart Props
// data → array from stats API weeklyStats
// ─────────────────────────────────────────
const WeeklyChart = ({ data = [], loading, error }) => {

  // Check if any problems were solved this week
  const hasData = data.some(d => d.count > 0)

  // Find the max count for highlighting
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <ChartWrapper
      title="📅 Weekly Activity"
      subtitle="Problems solved each day this week"
      loading={loading}
      error={error}
      isEmpty={!hasData}
      emptyMessage="No problems solved this week yet. Start coding!"
      height={280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          barSize={32}
        >
          {/* Grid lines — horizontal only */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-color)"
            vertical={false}
          />

          {/* X Axis — day names */}
          <XAxis
            dataKey="day"
            tick={{
              fill:       'var(--text-muted)',
              fontSize:   12,
              fontFamily: 'var(--font-main)'
            }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={false}
          />

          {/* Y Axis — problem count */}
          <YAxis
            allowDecimals={false}
            tick={{
              fill:       'var(--text-muted)',
              fontSize:   12,
              fontFamily: 'var(--font-main)'
            }}
            axisLine={false}
            tickLine={false}
          />

          {/* Tooltip on hover */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(108, 99, 255, 0.08)' }}
          />

          {/* Bars — highlight the max day */}
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            name="Problems"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.count === maxCount && entry.count > 0
                    ? 'var(--secondary-color)'   // Highlight best day
                    : entry.count > 0
                    ? 'var(--primary-color)'     // Normal solved day
                    : 'var(--border-color)'      // No problems day
                }
                fillOpacity={entry.count > 0 ? 1 : 0.4}
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export default WeeklyChart