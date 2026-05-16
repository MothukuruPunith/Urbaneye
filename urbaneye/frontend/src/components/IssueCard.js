import React from 'react';
import './IssueCard.css';

const CATEGORY_ICONS = {
  'Garbage Dump':        { icon: '🗑', color: '#ff8c42' },
  'Water Leakage':       { icon: '💧', color: '#4f8ef7' },
  'Potholes':            { icon: '🕳', color: '#a78bfa' },
  'Street Light Failure':{ icon: '💡', color: '#fbbf24' },
  'Sewage Overflow':     { icon: '⚠', color: '#ff4b6e' },
  'Broken Roads':        { icon: '🚧', color: '#f87171' },
};

const IssueCard = ({ issue, onViewDetails, onUpvote }) => {
  const cat = CATEGORY_ICONS[issue.category] || { icon: '📋', color: '#8b9ab5' };

  // Heatmap colour for priority score
  const priorityColor =
    issue.priorityScore >= 90 ? '#ff4b6e' :
    issue.priorityScore >= 75 ? '#ff8c42' :
    issue.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';

  const statusKey = issue.status.replace(/\s+/g, '-');

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="issue-card" style={{ '--cat-color': cat.color, '--priority-color': priorityColor }}>
      {/* Priority heat strip */}
      <div className="issue-card__heat-strip" />

      <div className="issue-card__header">
        <div className="issue-card__cat-icon">{cat.icon}</div>
        <div className="issue-card__meta">
          <span className="issue-card__category">{issue.category}</span>
          <span className="issue-card__time">{timeAgo(issue.createdAt)}</span>
        </div>
        <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
      </div>

      <h3 className="issue-card__title">{issue.title}</h3>
      <p className="issue-card__desc">{issue.description}</p>

      <div className="issue-card__location">
        <span className="location-pin">📍</span>
        <span>{issue.location}</span>
      </div>

      {/* Priority bar */}
      <div className="issue-card__priority-row">
        <span className="priority-label">Priority Score</span>
        <span className="priority-score">{issue.priorityScore}</span>
      </div>
      <div className="priority-bar">
        <div
          className="priority-fill"
          style={{ width: `${issue.priorityScore}%`, background: priorityColor }}
        />
      </div>

      <div className="issue-card__footer">
        <span className={`status-badge status-${statusKey}`}>{issue.status}</span>
        <div className="issue-card__actions">
          <button className="upvote-btn" onClick={() => onUpvote(issue.id)}>
            ▲ <span>{issue.upvotes}</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onViewDetails(issue)}>
            View
          </button>
        </div>
      </div>

      {issue.assignedTeam && (
        <div className="issue-card__team">
          <span className="team-label">Assigned:</span>
          <span className="team-name">{issue.assignedTeam}</span>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
