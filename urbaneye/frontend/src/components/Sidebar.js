import React, { useState } from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡', badge: null },
  { id: 'issues',    label: 'Issue Feed',  icon: '◈', badge: null },
  { id: 'report',    label: 'Report Issue',icon: '+', badge: null },
  { id: 'analytics', label: 'Analytics',   icon: '◎', badge: null },
  { id: 'hotspots',  label: 'Hotspot Map', icon: '⬡', badge: 'HOT' },
  { id: 'admin',     label: 'Admin Panel', icon: '⚙', badge: null },
];

const Sidebar = ({ activePage, onNavigate, issueCount }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay toggle */}
      <button className="mobile-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
        <span /><span /><span />
      </button>

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#00d4ff" strokeWidth="1.5"/>
              <polygon points="14,7 21,11 21,19 14,23 7,19 7,11" fill="rgba(0,212,255,0.12)" stroke="#00d4ff" strokeWidth="1"/>
              <circle cx="14" cy="15" r="3" fill="#00d4ff"/>
              <line x1="14" y1="2" x2="14" y2="7" stroke="#00d4ff" strokeWidth="1"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">UrbanEye</span>
            <span className="brand-sub">Civic Intelligence</span>
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* City info pill */}
        <div className="sidebar__city-pill">
          <span className="city-dot" />
          <span className="city-name">Chennai Municipal Corp.</span>
          <span className="city-status">LIVE</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'nav-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {item.id === 'issues' && issueCount > 0 && (
                <span className="nav-count">{issueCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Alert strip */}
        <div className="sidebar__alert">
          <div className="alert-dot" />
          <div className="alert-content">
            <div className="alert-title">System Active</div>
            <div className="alert-text">Real-time monitoring ON</div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="footer-version">UrbanEye v2.4.1</div>
          <div className="footer-dept">Dept. of Urban Development</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
