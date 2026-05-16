import React, { useState, useEffect, useCallback } from 'react';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import API_BASE from '../api';
import './Issues.css';

const CATEGORIES = ['All', 'Garbage Dump', 'Water Leakage', 'Potholes', 'Street Light Failure', 'Sewage Overflow', 'Broken Roads'];
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES   = ['All', 'Reported', 'Under Review', 'Assigned', 'Resolved'];

const Issues = ({ addToast }) => {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filters, setFilters]     = useState({ category: 'All', severity: 'All', status: 'All', search: '' });
  const [sortBy, setSortBy]       = useState('priority');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'All') params.set('category', filters.category);
      if (filters.severity !== 'All') params.set('severity', filters.severity);
      if (filters.status   !== 'All') params.set('status',   filters.status);
      if (filters.search)              params.set('search',   filters.search);

      const res = await fetch(`${API_BASE}/issues?${params.toString()}`);
      const data = await res.json();
      if (data.success) setIssues(data.data);
    } catch (err) {
      addToast('Failed to load issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleUpvote = async (id) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upvotes: issue.upvotes + 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i)));
        addToast('Upvoted! Your concern is noted.', 'success');
      }
    } catch {
      addToast('Upvote failed', 'error');
    }
  };

  // Sort client-side
  const sorted = [...issues].sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'upvotes')  return b.upvotes - a.upvotes;
    return 0;
  });

  const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="issues-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Feed</h1>
          <p className="page-subtitle">{issues.length} civic complaints found</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card issues-filter-bar">
        <div className="filter-search">
          <span>⊘</span>
          <input
            type="text"
            placeholder="Search by title, location, description..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-chips-group">
          <span className="filter-chips-label">Category</span>
          <div className="filter-chips">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${filters.category === c ? 'filter-chip--active' : ''}`}
                onClick={() => setFilter('category', c)}
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="form-label">Severity</label>
            <select className="form-select" value={filters.severity} onChange={(e) => setFilter('severity', e.target.value)}>
              {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="priority">Priority Score</option>
              <option value="newest">Newest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}
            onClick={() => { setFilters({ category: 'All', severity: 'All', status: 'All', search: '' }); setSortBy('priority'); }}>
            Reset
          </button>
        </div>
      </div>

      {/* Issue Grid */}
      {loading ? (
        <div className="loader-container"><div className="loader" /><div className="loader-text">Loading issues...</div></div>
      ) : sorted.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon">◈</div>
          <div className="empty-state-title">No issues found</div>
          <div className="empty-state-text">Try adjusting your filters or search term</div>
        </div>
      ) : (
        <div className="issues-grid">
          {sorted.map((issue, i) => (
            <div key={issue.id} style={{ animationDelay: `${i * 40}ms` }}>
              <IssueCard
                issue={issue}
                onViewDetails={setSelected}
                onUpvote={handleUpvote}
              />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <IssueModal
          issue={selected}
          onClose={() => setSelected(null)}
          onUpdate={(issue) => { setSelected(null); addToast('Use Admin Panel to manage issues', 'info'); }}
        />
      )}
    </div>
  );
};

export default Issues;
