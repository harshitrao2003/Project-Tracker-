// ============================================
// ResumeCard.jsx — Resume Display Card
// ============================================

import { formatDate } from '../../utils/helpers'

// Status color mapping
const STATUS_COLORS = {
  Draft:     'var(--text-muted)',
  Ready:     'var(--success-color)',
  Submitted: 'var(--primary-color)',
  Updated:   'var(--warning-color)'
}

// ATS score color
const getAtsColor = (score) => {
  if (score >= 80) return 'var(--success-color)'
  if (score >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const ResumeCard = ({ resume = {}, onEdit = () => {}, onDelete = () => {} }) => {
  const title = resume.title || 'Untitled Resume'
  const status = resume.status || 'Draft'
  const company = resume.targetCompany || 'General'
  const createdAt = resume.createdAt || null

  return (
    <div className="resume-card">

      {/* Header */}
      <div className="resume-card-header">
        <div className="resume-card-title-row">
          <h3 className="resume-card-title">{title}</h3>
          <span
            className="resume-card-version"
          >
            {resume.version}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className="resume-status-badge"
          style={{
            color:           STATUS_COLORS[resume.status],
            backgroundColor: `${STATUS_COLORS[resume.status]}18`
          }}
        >
          {status}
        </span>
      </div>

      {/* Target Company */}
      <div className="resume-card-company">
        🏢 {company}
      </div>

      {/* ATS Score */}
      {resume.atsScore && (
        <div className="resume-ats">
          <span className="resume-ats-label">ATS Score</span>
          <div className="resume-ats-bar">
            <div
              className="resume-ats-fill"
              style={{
                width:           `${resume.atsScore}%`,
                backgroundColor: getAtsColor(resume.atsScore)
              }}
            />
          </div>
          <span
            className="resume-ats-score"
            style={{ color: getAtsColor(resume.atsScore) }}
          >
            {resume.atsScore}%
          </span>
        </div>
      )}

      {/* Highlights */}
      {resume.highlights?.length > 0 && (
        <div className="resume-highlights">
          {resume.highlights.slice(0, 3).map((h, i) => (
            <span key={i} className="resume-highlight-tag">
              {h}
            </span>
          ))}
          {resume.highlights.length > 3 && (
            <span className="resume-highlight-tag resume-highlight-more">
              +{resume.highlights.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {resume.notes && (
        <p className="resume-card-notes">{resume.notes}</p>
      )}

      {/* Footer */}
      <div className="resume-card-footer">
        <span className="resume-card-date">
          {formatDate(createdAt)}
        </span>
        <div className="resume-card-actions">
          {resume.resumeLink && (
            <a
              href={resume.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="Open resume"
            >
              🔗
            </a>
          )}
          <button
            className="btn-icon"
            onClick={() => onEdit(resume)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => onDelete(resume._id)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>
  )
}

export default ResumeCard