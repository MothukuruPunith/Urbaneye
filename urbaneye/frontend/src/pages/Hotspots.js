import React, { useState, useEffect } from 'react';
import './Hotspots.css';
import API_BASE from '../api';

const CATEGORY_ICONS = {
  'Garbage Dump': '🗑', 'Water Leakage': '💧', 'Potholes': '🕳',
  'Street Light Failure': '💡', 'Sewage Overflow': '⚠', 'Broken Roads': '🚧',
};

const HeatCell = ({ value, max }) => {
  const pct = max > 0 ? value / max : 0;
  const bg =
    pct > 0.8 ? 'rgba(255,75,110,0.25)' :
    pct > 0.6 ? 'rgba(255,140,66,0.2)' :
    pct > 0.4 ? 'rgba(251,191,36,0.15)' :
    pct > 0.2 ? 'rgba(0,212,255,0.1)' :
                'rgba(255,255,255,0.03)';
  const color =
    pct > 0.8 ? '#ff4b6e' :
    pct > 0.6 ? '#ff8c42' :
    pct > 0.4 ? '#fbbf24' :
    pct > 0.2 ? '#00d4ff' :
                'var(--text-muted)';
  return (
    <td style={{ background: bg, color, fontWeight: 700, textAlign: 'center', padding: '12px 8px', fontSize: '0.85rem', transition: 'all 0.3s' }}>
      {value}
    </td>
  );
};

const Hotspots = () => {
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    Promise.all([fetch(`${API_BASE}/analytics`), fetch(`${API_BASE}/issues`)])
      .then(async ([a, i]) => {
        const aData = await a.json();
        const iData = await i.json();
        if (aData.success) setAnalytics(aData.data);
        if (iData.success) setIssues(iData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container"><div className="loader" /><div className="loader-text">Mapping hotspots...</div></div>;
  if (!analytics) return <div className="empty-state"><div className="empty-state-icon">⚠</div></div>;

  const { hotspots, categoryBreakdown } = analytics;

  // Build heatmap matrix: area × category
  const categories = ['Garbage Dump', 'Water Leakage', 'Potholes', 'Street Light Failure', 'Sewage Overflow', 'Broken Roads'];
  const areas = hotspots.map((h) => h.area);

  const matrix = areas.map((area) =>
    categories.map((cat) =>
      issues.filter((i) => i.area === area && i.category === cat && i.status !== 'Resolved').length
    )
  );
  const maxVal = Math.max(1, ...matrix.flat());

  const areaIssues = selectedArea
    ? issues.filter((i) => i.area === selectedArea && i.status !== 'Resolved')
    : [];

  return (
    <div className="hotspots-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hotspot Analysis</h1>
          <p className="page-subtitle">Recurring problem zones and area-wise issue intelligence</p>
        </div>
      </div>

      {/* Top hotspot cards */}
      <div className="hotspot-rank-grid">
        {hotspots.slice(0, 6).map((h, i) => {
          const intensity =
            h.unresolved >= 4 ? 'critical' :
            h.unresolved >= 2 ? 'high' :
            h.unresolved >= 1 ? 'medium' : 'low';
          return (
            <div
              key={h.area}
              className={`hotspot-rank-card glass-card hotspot-rank-card--${intensity} ${selectedArea === h.area ? 'hotspot-rank-card--selected' : ''}`}
              onClick={() => setSelectedArea(selectedArea === h.area ? null : h.area)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="hrc-rank">{i + 1}</div>
              <div className="hrc-body">
                <div className="hrc-area">{h.area}</div>
                <div className="hrc-stats">
                  <span className="hrc-stat"><span className="hrc-stat-val">{h.unresolved}</span> active</span>
                  <span className="hrc-sep">·</span>
                  <span className="hrc-stat"><span className="hrc-stat-val hrc-critical">{h.critical}</span> critical</span>
                </div>
              </div>
              <div className={`hrc-intensity hrc-intensity--${intensity}`}>
                {intensity === 'critical' ? '🔴' : intensity === 'high' ? '🟠' : intensity === 'medium' ? '🟡' : '🟢'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Area drill-down */}
      {selectedArea && (
        <div className="glass-card hotspot-drilldown animate-fade-up">
          <h3 className="section-title">📍 {selectedArea} – Active Issues</h3>
          {areaIssues.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">✓</div>
              <div className="empty-state-title">No active issues in this area</div>
            </div>
          ) : (
            <div className="drilldown-list">
              {areaIssues.map((issue) => {
                const priorityColor = issue.priorityScore >= 90 ? '#ff4b6e' : issue.priorityScore >= 75 ? '#ff8c42' : issue.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';
                return (
                  <div key={issue.id} className="drilldown-item">
                    <div className="di-bar" style={{ background: priorityColor }} />
                    <div className="di-icon">{CATEGORY_ICONS[issue.category]}</div>
                    <div className="di-info">
                      <div className="di-title">{issue.title}</div>
                      <div className="di-meta">{issue.category} · {issue.location}</div>
                    </div>
                    <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
                    <span className="di-score" style={{ color: priorityColor }}>{issue.priorityScore}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Heatmap Matrix */}
      <div className="glass-card hotspot-heatmap-card">
        <h3 className="section-title">🗺 Area × Category Heatmap</h3>
        <p className="heatmap-note">Click an area card above to drill down. Darker cells = more active issues.</p>
        <div className="heatmap-scroll">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="heatmap-area-header">Area</th>
                {categories.map((cat) => (
                  <th key={cat} className="heatmap-cat-header">
                    <span className="cat-header-icon">{CATEGORY_ICONS[cat]}</span>
                    <span className="cat-header-label">{cat.split(' ')[0]}</span>
                  </th>
                ))}
                <th className="heatmap-total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area, ai) => (
                <tr key={area} className={`heatmap-row ${selectedArea === area ? 'heatmap-row--selected' : ''}`}
                  onClick={() => setSelectedArea(selectedArea === area ? null : area)}>
                  <td className="heatmap-area-cell">{area}</td>
                  {matrix[ai].map((val, ci) => (
                    <HeatCell key={ci} value={val} max={maxVal} />
                  ))}
                  <td className="heatmap-total-cell" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {matrix[ai].reduce((s, v) => s + v, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="heatmap-legend">
          <span className="legend-title">Intensity:</span>
          {[
            { label: 'None', bg: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' },
            { label: 'Low',  bg: 'rgba(0,212,255,0.1)',    color: '#00d4ff' },
            { label: 'Med',  bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
            { label: 'High', bg: 'rgba(255,140,66,0.2)',   color: '#ff8c42' },
            { label: 'Crit', bg: 'rgba(255,75,110,0.25)', color: '#ff4b6e' },
          ].map((l) => (
            <div key={l.label} className="legend-item">
              <div className="legend-swatch" style={{ background: l.bg, border: `1px solid ${l.color}` }} />
              <span style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Summary */}
      <div className="glass-card hotspot-cat-summary">
        <h3 className="section-title">Most Common Issue Types</h3>
        <div className="cat-summary-grid">
          {[...categoryBreakdown].sort((a, b) => b.count - a.count).map((cat, i) => {
            const maxCount = Math.max(...categoryBreakdown.map((c) => c.count));
            const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
            return (
              <div key={cat.category} className="cat-summary-item">
                <div className="cat-summary-header">
                  <span className="cat-summary-icon">{CATEGORY_ICONS[cat.category]}</span>
                  <span className="cat-summary-name">{cat.category}</span>
                  <span className="cat-summary-count">{cat.count}</span>
                </div>
                <div className="priority-bar">
                  <div className="priority-fill" style={{ width: `${pct}%`, background: i === 0 ? '#ff4b6e' : i === 1 ? '#ff8c42' : i === 2 ? '#fbbf24' : '#4f8ef7' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hotspots;
