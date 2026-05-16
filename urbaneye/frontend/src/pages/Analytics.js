import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
} from 'recharts';
import './Analytics.css';
import API_BASE from '../api';

const CATEGORY_COLORS = {
  'Garbage Dump': '#ff8c42', 'Water Leakage': '#4f8ef7', 'Potholes': '#a78bfa',
  'Street Light Failure': '#fbbf24', 'Sewage Overflow': '#ff4b6e', 'Broken Roads': '#f87171',
};

const STATUS_COLORS = { Reported: '#fbbf24', 'Under Review': '#4f8ef7', Assigned: '#a78bfa', Resolved: '#00e5a0' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: '#8b9ab5', fontSize: '0.72rem', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00d4ff', fontSize: '0.85rem', fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/analytics`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container"><div className="loader" /><div className="loader-text">Crunching numbers...</div></div>;
  if (!data)   return <div className="empty-state"><div className="empty-state-icon">⚠</div><div className="empty-state-title">Analytics unavailable</div></div>;

  const { overview, statusBreakdown, categoryBreakdown, hotspots, monthlyTrend, topUpvoted } = data;

  const statusPieData    = Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }));
  const severityRadar    = [
    { factor: 'Critical', value: data.severityBreakdown.Critical },
    { factor: 'High',     value: data.severityBreakdown.High },
    { factor: 'Medium',   value: data.severityBreakdown.Medium },
    { factor: 'Low',      value: data.severityBreakdown.Low },
  ];

  // Efficiency metrics
  const efficiency = [
    { metric: 'Resolution Rate', value: overview.resolutionRate, max: 100, unit: '%', color: '#00e5a0' },
    { metric: 'Avg Response',    value: Math.min(overview.avgResolutionHours, 72), max: 72, unit: 'h', color: '#4f8ef7', raw: overview.avgResolutionHours },
    { metric: 'Critical Active', value: overview.criticalActive, max: Math.max(overview.total, 1), unit: '', color: '#ff4b6e' },
    { metric: 'Total Active',    value: overview.active, max: Math.max(overview.total, 1), unit: '', color: '#ff8c42' },
  ];

  return (
    <div className="analytics-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Center</h1>
          <p className="page-subtitle">Performance metrics, trends, and departmental workload insights</p>
        </div>
        <div className="analytics-live-badge">
          <span className="live-dot" />
          Live Data
        </div>
      </div>

      {/* KPI Strip */}
      <div className="analytics-kpi-strip">
        {[
          { label: 'Total Reports', val: overview.total, color: '#00d4ff' },
          { label: 'Resolved', val: statusBreakdown.Resolved, color: '#00e5a0' },
          { label: 'Critical Active', val: overview.criticalActive, color: '#ff4b6e' },
          { label: 'Resolution Rate', val: `${overview.resolutionRate}%`, color: '#00e5a0' },
          { label: 'Avg Resolution', val: `${overview.avgResolutionHours}h`, color: '#4f8ef7' },
          { label: 'Community Votes', val: overview.totalCitizensEngaged, color: '#a78bfa' },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-item glass-card">
            <div className="kpi-val" style={{ color: kpi.color }}>{kpi.val}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Efficiency Meters */}
      <div className="glass-card analytics-card">
        <h3 className="section-title">Department Efficiency Metrics</h3>
        <div className="efficiency-grid">
          {efficiency.map((e) => {
            const pct = Math.round((e.value / e.max) * 100);
            return (
              <div key={e.metric} className="efficiency-item">
                <div className="efficiency-header">
                  <span className="efficiency-name">{e.metric}</span>
                  <span className="efficiency-val" style={{ color: e.color }}>{e.raw ?? e.value}{e.unit}</span>
                </div>
                <div className="efficiency-track">
                  <div className="efficiency-fill" style={{ width: `${pct}%`, background: e.color }} />
                </div>
                <div className="efficiency-pct">{pct}% of target</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="analytics-charts-row">
        {/* Trend */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">Monthly Issue Growth Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: '#00d4ff', r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} name="New Issues" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={4} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusPieData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || '#8b9ab5'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#8b9ab5', fontSize: '0.75rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="analytics-charts-row">
        {/* Category Bar */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryBreakdown} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#8b9ab5', fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Issues" radius={[0, 4, 4, 0]}>
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#4f8ef7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Radar */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={severityRadar} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: '#8b9ab5', fontSize: 11 }} />
              <Radar name="Issues" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hotspot + Top Upvoted */}
      <div className="analytics-charts-row">
        {/* Hotspot bar */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">🔥 Hotspot Area Analysis</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hotspots} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="area" tick={{ fill: '#8b9ab5', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="unresolved" name="Unresolved" fill="#ff8c42" radius={[4, 4, 0, 0]} />
              <Bar dataKey="critical"   name="Critical"   fill="#ff4b6e" radius={[4, 4, 0, 0]} />
              <Legend formatter={(v) => <span style={{ color: '#8b9ab5', fontSize: '0.75rem' }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Upvoted */}
        <div className="glass-card analytics-card">
          <h3 className="section-title">Community Most Concerned</h3>
          <div className="top-upvoted-list">
            {data.topUpvoted.map((issue, i) => (
              <div key={issue.id} className="top-upvoted-item">
                <div className="top-rank" style={{ color: i < 2 ? 'var(--accent-red)' : 'var(--text-muted)' }}>#{i + 1}</div>
                <div className="top-info">
                  <div className="top-title">{issue.title}</div>
                  <div className="top-meta">
                    <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{issue.area}</span>
                  </div>
                </div>
                <div className="top-upvotes">▲ {issue.upvotes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
