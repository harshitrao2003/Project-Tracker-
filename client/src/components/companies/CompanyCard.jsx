// ============================================
// CompanyCard.jsx
// Single draggable card on the Kanban board
// ============================================

import { formatDate } from '../../utils/helpers'

const CompanyCard = ({
  company,
  onEdit,
  onDelete,
  onDragStart
}) => {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, company)}
    >

      {/* Header */}
      <div className="kanban-card-header">
        <h4 className="kanban-card-title">{company.companyName}</h4>
        <div className="kanban-card-actions">
          <button
            className="kanban-card-btn"
            onClick={() => onEdit(company)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="kanban-card-btn kanban-card-btn-danger"
            onClick={() => onDelete(company._id)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Role */}
      <p className="kanban-card-role">{company.role}</p>

      {/* Package */}
      {company.package && (
        <div className="kanban-card-package">
          💰 {company.package}
        </div>
      )}

      {/* Footer */}
      <div className="kanban-card-footer">
        <span className="kanban-card-date">
          📅 {formatDate(company.appliedDate)}
        </span>
        {company.jobUrl && (
          <a
            href={company.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="kanban-card-link"
            onClick={e => e.stopPropagation()}
          >
            🔗
          </a>
        )}
      </div>

    </div>
  )
}

export default CompanyCard