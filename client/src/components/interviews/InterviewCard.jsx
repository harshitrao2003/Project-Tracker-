// ============================================
// InterviewCard.jsx — Interview Record Card
// ============================================

import { formatDate } from '../../utils/helpers'

const RESULT_COLORS = {
  Passed:    'var(--success-color)',
  Failed:    'var(--danger-color)',
  Pending:   'var(--warning-color)',
  'No Result': 'var(--text-muted)'
}

const TYPE_ICONS = {
  DSA:              '💻',
  Technical:        '⚙️',
  HR:               '🤝',
  'System Design':  '🏗️',
  'Group Discussion':'👥',
  'Machine Coding': '🖥️',
  Behavioral:       '🧠'
}

const getScoreColor = (score) => {
  if (score >= 8) return 'var(--success-color)'
  if (score >= 6) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const InterviewCard = ({ interview, onEdit, onDelete }) => {
  return (
    <div className="interview-card">

      {/* Header */}
      <div className="interview-card-header">
        <div className="interview-card-title-row">
          <span className="interview-type-icon">
            {TYPE_ICONS[interview.interviewType] || '🎤'}
          </span>
          <div>
            <h4 className="interview-card-company">
              {interview.companyName}
            </h4>
            <p className="interview-card-type">
              {interview.interviewType}
            </p>
          </div>
        </div>

        {/* Score */}
        {interview.score !== null && interview.score !== undefined && (
          <div
            className="interview-score"
            style={{ color: getScoreColor(interview.score) }}
          >
            {interview.score}<span>/10</span>
          </div>
        )}
      </div>

      {/* Result + Difficulty */}
      <div className="interview-card-badges">
        <span
          className="interview-result-badge"
          style={{
            color:           RESULT_COLORS[interview.result],
            backgroundColor: `${RESULT_COLORS[interview.result]}18`
          }}
        >
          {interview.result}
        </span>
        <span className="interview-difficulty-badge">
          {interview.difficulty}
        </span>
        <span className="interview-duration-badge">
          ⏱️ {interview.duration}m
        </span>
      </div>

      {/* Topics */}
      {interview.topicsCovered?.length > 0 && (
        <div className="interview-topics">
          {interview.topicsCovered.slice(0, 4).map((t, i) => (
            <span key={i} className="interview-topic-tag">{t}</span>
          ))}
          {interview.topicsCovered.length > 4 && (
            <span className="interview-topic-tag">
              +{interview.topicsCovered.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Feedback */}
      {interview.feedback && (
        <p className="interview-feedback">{interview.feedback}</p>
      )}

      {/* Next Action */}
      {interview.nextAction && (
        <div className="interview-next-action">
          <span>🎯</span>
          <span>{interview.nextAction}</span>
        </div>
      )}

      {/* Footer */}
      <div className="interview-card-footer">
        <span className="interview-card-date">
          {formatDate(interview.date)}
        </span>
        <div className="action-buttons">
          <button
            className="btn-icon"
            onClick={() => onEdit(interview)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => onDelete(interview._id)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>
  )
}

export default InterviewCard