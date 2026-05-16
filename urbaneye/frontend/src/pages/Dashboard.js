import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import API_BASE from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import './Dashboard.css';

const CATEGORY_COLORS = {
  'Garbage Dump': '#ff8c42',
  'Water Leakage': '#4f8ef7',
  'Potholes': '#a78bfa',
  'Street Light Failure': '#fbbf24',
  'Sewage Overflow': '#ff4b6e',
  'Broken Roads': '#f87171',
};

const PIE_COLORS = ['#fbbf24', '#4f8ef7', '#a78bfa', '#00e5a0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: '#8b9ab5', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00d4ff', fontSize: '0.85rem', fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, issuesRes] = await Promise.all([
          fetch(`${API_BASE}/analytics`),
          fetch(`${API_BASE}/issues`),
        ]);
        const analyticsData = await analyticsRes.json();
        const issuesData = await issuesRes.json();

        if (analyticsData.success) setAnalytics(analyticsData.data);
        if (issuesData.success) setRecentIssues(issuesData.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <div className="loader-text">Loading Dashboard...</div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="empty-state"><div className="empty-state-icon">⚠</div><div className="empty-state-title">Could not load dashboard data</div></div>;
  }

  const { overview, statusBreakdown, categoryBreakdown, hotspots, monthlyTrend } = analytics;

  const statusPieData = Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Municipal Dashboard</h1>
          <p className="page-subtitle">Real-time overview of Chennai's civic infrastructure status</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('report')}>
          + Report Issue
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid-4 dashboard__stats">
        <StatCard title="Total Issues" value={overview.total} sub="All time reports" icon="◈" accent="cyan" delay={0} />
        <StatCard title="Active Issues" value={overview.active} sub="Awaiting resolution" icon="⚡" accent="orange" trend={12} delay={60} />
        <StatCard title="Critical Alerts" value={overview.criticalActive} sub="Immediate action" icon="⚠" accent="red" delay={120} />
        <StatCard title="Resolution Rate" value={`${overview.resolutionRate}%`} sub="Issues resolved" icon="✓" accent="green" trend={5} delay={180} />
      </div>

      <div className="grid-4 dashboard__stats">
        <StatCard title="Avg. Resolution" value={`${overview.avgResolutionHours}h`} sub="Response time" icon="⏱" accent="blue" delay={240} />
        <StatCard title="Citizens Engaged" value={overview.totalCitizensEngaged} sub="Community upvotes" icon="▲" accent="purple" delay={300} />
        <StatCard title="Reported" value={statusBreakdown.Reported} sub="Awaiting review" icon="◎" accent="orange" delay={360} />
        <StatCard title="Resolved" value={statusBreakdown.Resolved} sub="Successfully closed" icon="✦" accent="green" delay={420} />
      </div>

      {/* Charts Row */}
      <div className="dashboard__charts-row">
        {/* Monthly Trend */}
        <div className="glass-card dashboard__chart-card">
          <h3 className="section-title">Monthly Issue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} activeDot={{ r: 6, fill: '#00d4ff' }} name="Issues" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="glass-card dashboard__chart-card dashboard__chart-card--sm">
          <h3 className="section-title">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {statusPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#8b9ab5', fontSize: '0.75rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card dashboard__bar-chart">
        <h3 className="section-title">Issues by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryBreakdown} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#8b9ab5', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b9ab5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
              {categoryBreakdown.map((entry, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#4f8ef7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Hotspots + Recent Issues */}
      <div className="dashboard__bottom-row">
        {/* Hotspot Table */}
        <div className="glass-card dashboard__hotspot-card">
          <h3 className="section-title">🔥 Area Hotspots</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Area</th>
                <th>Total</th>
                <th>Unresolved</th>
                <th>Critical</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((h, i) => (
                <tr key={h.area}>
                  <td>
                    <span className="hotspot-rank" style={{ color: i < 3 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{h.area}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{h.total}</td>
                  <td>
                    <span style={{ color: h.unresolved > 2 ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 600 }}>
                      {h.unresolved}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: h.critical > 0 ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {h.critical}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Issues */}
        <div className="glass-card dashboard__recent-card">
          <h3 className="section-title">Recent Reports</h3>
          <div className="recent-issues-list">
            {recentIssues.map((issue) => {
              const priorityColor =
                issue.priorityScore >= 90 ? '#ff4b6e' :
                issue.priorityScore >= 75 ? '#ff8c42' :
                issue.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';
              return (
                <div key={issue.id} className="recent-issue-item">
                  <div className="recent-issue-bar" style={{ background: priorityColor }} />
                  <div className="recent-issue-info">
                    <div className="recent-issue-title">{issue.title}</div>
                    <div className="recent-issue-meta">
                      <span>{issue.area}</span>
                      <span>·</span>
                      <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
                    </div>
                  </div>
                  <span className={`status-badge status-${issue.status.replace(/\s+/g,'-')}`}>{issue.status}</span>
                </div>
              );
            })}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }} onClick={() => onNavigate('issues')}>
            View All Issues →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
