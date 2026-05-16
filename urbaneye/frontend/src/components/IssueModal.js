import React from 'react';
import './IssueModal.css';

const CATEGORY_ICONS = {
  'Garbage Dump': '🗑', 'Water Leakage': '💧', 'Potholes': '🕳',
  'Street Light Failure': '💡', 'Sewage Overflow': '⚠', 'Broken Roads': '🚧',
};

const IssueModal = ({ issue, onClose, onUpdate }) => {
  if (!issue) return null;

  const statusKey = issue.status?.replace(/\s+/g, '-');
  const priorityColor =
    issue.priorityScore >= 90 ? '#ff4b6e' :
    issue.priorityScore >= 75 ? '#ff8c42' :
    issue.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-fade-up">
        {/* Priority accent line */}
        <div className="modal__accent-line" style={{ background: priorityColor }} />

        <div className="modal__header">
          <div className="modal__icon">{CATEGORY_ICONS[issue.category] || '📋'}</div>
          <div className="modal__header-info">
            <span className="modal__category">{issue.category}</span>
            <h2 className="modal__title">{issue.title}</h2>
          </div>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">
          {/* Status & badges */}
          <div className="modal__badges">
            <span className={`status-badge status-${statusKey}`}>{issue.status}</span>
            <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
            <span className="modal__id">ID: {issue.id}</span>
          </div>

          {/* Image */}
          {issue.imageUrl && (
            <div className="modal__image-wrap">
              <img src={issue.imageUrl} alt="Issue" className="modal__image" onError={(e) => e.target.style.display='none'} />
              <div className="image-overlay-tag">📸 Reported Image</div>
            </div>
          )}

          {/* Description */}
          <div className="modal__section">
            <div className="modal__section-title">Description</div>
            <p className="modal__desc">{issue.description}</p>
          </div>

          {/* Info grid */}
          <div className="modal__info-grid">
            <div className="info-cell">
              <div className="info-label">📍 Location</div>
              <div className="info-value">{issue.location}</div>
            </div>
            <div className="info-cell">
              <div className="info-label">🏙 Area</div>
              <div className="info-value">{issue.area}</div>
            </div>
            <div className="info-cell">
              <div className="info-label">👤 Reported By</div>
              <div className="info-value">{issue.reportedBy}</div>
            </div>
            <div className="info-cell">
              <div className="info-label">👥 Community Upvotes</div>
              <div className="info-value" style={{ color: 'var(--accent-cyan)' }}>▲ {issue.upvotes}</div>
            </div>
            <div className="info-cell">
              <div className="info-label">📅 Reported</div>
              <div className="info-value">{formatDate(issue.createdAt)}</div>
            </div>
            <div className="info-cell">
              <div className="info-label">🔄 Last Updated</div>
              <div className="info-value">{formatDate(issue.updatedAt)}</div>
            </div>
            {issue.resolvedAt && (
              <div className="info-cell">
                <div className="info-label">✅ Resolved</div>
                <div className="info-value" style={{ color: 'var(--accent-green)' }}>{formatDate(issue.resolvedAt)}</div>
              </div>
            )}
            {issue.assignedTeam && (
              <div className="info-cell">
                <div className="info-label">🔧 Assigned Team</div>
                <div className="info-value" style={{ color: 'var(--accent-cyan)' }}>{issue.assignedTeam}</div>
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="modal__priority-section">
            <div className="modal__section-title">Smart Priority Score</div>
            <div className="modal__priority-bar-row">
              <span className="modal__priority-num" style={{ color: priorityColor }}>{issue.priorityScore}/100</span>
              <span className="modal__priority-label">{issue.priorityLabel || 'Calculating...'}</span>
            </div>
            <div className="priority-bar">
              <div className="priority-fill" style={{ width: `${issue.priorityScore}%`, background: priorityColor }} />
            </div>
          </div>

          {/* Remarks */}
          {issue.remarks && (
            <div className="modal__section">
              <div className="modal__section-title">Admin Remarks</div>
              <div className="modal__remarks">{issue.remarks}</div>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => onUpdate(issue)}>
            ✏ Manage Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
