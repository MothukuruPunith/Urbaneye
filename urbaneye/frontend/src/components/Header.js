import React, { useState } from 'react';
import './Header.css';

const Header = ({ activePage, onNavigate }) => {
  const [searchVal, setSearchVal] = useState('');

  const titles = {
    dashboard: { label: 'Municipal Dashboard', sub: 'Real-time city infrastructure overview' },
    issues:    { label: 'Issue Feed',           sub: 'All reported civic complaints' },
    report:    { label: 'Report Issue',         sub: 'Submit a new civic complaint' },
    analytics: { label: 'Analytics',            sub: 'Trends, patterns & performance metrics' },
    hotspots:  { label: 'Hotspot Analysis',     sub: 'Recurring problem zones & area intelligence' },
    admin:     { label: 'Admin Panel',           sub: 'Manage issues, teams & resolutions' },
  };

  const current = titles[activePage] || titles.dashboard;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="header">
      <div className="header__left">
        <div className="breadcrumb">
          <span className="breadcrumb-root">UrbanEye</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{current.label}</span>
        </div>
        <div className="header__subtitle">{current.sub}</div>
      </div>

      <div className="header__center">
        <div className="header-search">
          <span className="search-icon">⊘</span>
          <input
            type="text"
            placeholder="Search issues, areas, categories..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="header-search-input"
          />
          {searchVal && (
            <button className="search-clear" onClick={() => setSearchVal('')}>×</button>
          )}
        </div>
      </div>

      <div className="header__right">
        <div className="header-datetime">
          <span className="header-date">{dateStr}</span>
          <span className="header-time">{timeStr}</span>
        </div>
        <div className="header-divider" />
        <button className="header-btn" title="Notifications">
          <span className="notif-icon">◎</span>
          <span className="notif-dot" />
        </button>
        <div className="header-avatar">
          <span>A</span>
          <div className="avatar-info">
            <span className="avatar-name">Admin</span>
            <span className="avatar-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
