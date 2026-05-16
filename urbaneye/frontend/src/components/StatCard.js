import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, sub, icon, accent, trend, delay = 0 }) => {
  const accentColors = {
    cyan:   { bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.2)',   color: '#00d4ff', glow: '0 0 20px rgba(0,212,255,0.15)' },
    red:    { bg: 'rgba(255,75,110,0.08)',   border: 'rgba(255,75,110,0.2)',  color: '#ff4b6e', glow: '0 0 20px rgba(255,75,110,0.15)' },
    green:  { bg: 'rgba(0,229,160,0.08)',    border: 'rgba(0,229,160,0.2)',   color: '#00e5a0', glow: '0 0 20px rgba(0,229,160,0.15)' },
    orange: { bg: 'rgba(255,140,66,0.08)',   border: 'rgba(255,140,66,0.2)',  color: '#ff8c42', glow: '0 0 20px rgba(255,140,66,0.15)' },
    blue:   { bg: 'rgba(79,142,247,0.08)',   border: 'rgba(79,142,247,0.2)',  color: '#4f8ef7', glow: '0 0 20px rgba(79,142,247,0.15)'  },
    purple: { bg: 'rgba(167,139,250,0.08)',  border: 'rgba(167,139,250,0.2)', color: '#a78bfa', glow: '0 0 20px rgba(167,139,250,0.15)' },
  };

  const theme = accentColors[accent] || accentColors.cyan;

  return (
    <div
      className="stat-card animate-fade-up"
      style={{
        '--accent-bg':     theme.bg,
        '--accent-border': theme.border,
        '--accent-color':  theme.color,
        '--accent-glow':   theme.glow,
        animationDelay:    `${delay}ms`,
      }}
    >
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__title">{title}</div>
        {sub && <div className="stat-card__sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
      <div className="stat-card__glow" />
    </div>
  );
};

export default StatCard;
