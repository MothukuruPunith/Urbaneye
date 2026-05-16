import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';
import API_BASE from '../api';

const STATUSES   = ['Reported', 'Under Review', 'Assigned', 'Resolved'];
const TEAMS      = ['Zone A Sanitation', 'Zone B Sanitation', 'Zone C Sanitation', 'Underground Drainage Dept', 'CMWSSB Emergency', 'CMWSSB Zone A', 'Roads & Highways Dept', 'Electrical Division 1', 'Electrical Division 2', 'Electrical Division 3', 'Emergency Response Unit'];
const CATEGORIES = ['All', 'Garbage Dump', 'Water Leakage', 'Potholes', 'Street Light Failure', 'Sewage Overflow', 'Broken Roads'];

const Admin = ({ addToast }) => {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState('All');
  const [deleting, setDeleting]   = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/issues`);
      const data = await res.json();
      if (data.success) setIssues(data.data);
    } catch { addToast('Failed to load issues', 'error'); }
    finally   { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const openEdit = (issue) => {
    setEditing(issue);
    setForm({ status: issue.status, assignedTeam: issue.assignedTeam || '', remarks: issue.remarks || '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/issues/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Issue updated successfully', 'success');
        setEditing(null);
        fetchIssues();
      } else {
        addToast(data.message || 'Update failed', 'error');
      }
    } catch { addToast('Server error', 'error'); }
    finally   { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this issue?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Issue deleted', 'info');
        setIssues((prev) => prev.filter((i) => i.id !== id));
      }
    } catch { addToast('Delete failed', 'error'); }
    finally   { setDeleting(null); }
  };

  const quickStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      addToast(`Status changed to "${status}"`, 'success');
      fetchIssues();
    } catch { addToast('Update failed', 'error'); }
  };

  const filtered = filter === 'All' ? issues : issues.filter((i) => i.status === filter);

  const counts = {
    All: issues.length,
    Reported: issues.filter((i) => i.status === 'Reported').length,
    'Under Review': issues.filter((i) => i.status === 'Under Review').length,
    Assigned: issues.filter((i) => i.status === 'Assigned').length,
    Resolved: issues.filter((i) => i.status === 'Resolved').length,
  };

  return (
    <div className="admin-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage issues, assign teams, and track resolutions</p>
        </div>
        <div className="admin-badge">
          <span>⚙</span> Admin Mode
        </div>
      </div>

      {/* Status Tabs */}
      <div className="admin-tabs">
        {['All', 'Reported', 'Under Review', 'Assigned', 'Resolved'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${filter === tab ? 'admin-tab--active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            <span className="admin-tab-count">{counts[tab] || 0}</span>
          </button>
        ))}
      </div>

      {/* Issue Table */}
      {loading ? (
        <div className="loader-container"><div className="loader" /><div className="loader-text">Loading issues...</div></div>
      ) : (
        <div className="glass-card admin-table-card">
          <table className="data-table admin-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Area</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Team</th>
                <th>Upvotes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No issues in this category</td></tr>
              ) : filtered.map((issue) => {
                const priorityColor =
                  issue.priorityScore >= 90 ? '#ff4b6e' :
                  issue.priorityScore >= 75 ? '#ff8c42' :
                  issue.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';
                const statusKey = issue.status.replace(/\s+/g, '-');
                return (
                  <tr key={issue.id} className="admin-row">
                    <td>
                      <div className="admin-priority">
                        <span className="admin-priority-score" style={{ color: priorityColor }}>{issue.priorityScore}</span>
                        <div className="priority-bar" style={{ width: 50 }}>
                          <div className="priority-fill" style={{ width: `${issue.priorityScore}%`, background: priorityColor }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-issue-title">{issue.title}</div>
                      <div className="admin-issue-id">{issue.id}</div>
                    </td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{issue.category}</span></td>
                    <td><span style={{ fontSize: '0.8rem' }}>{issue.area}</span></td>
                    <td><span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span></td>
                    <td><span className={`status-badge status-${statusKey}`}>{issue.status}</span></td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: issue.assignedTeam ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                        {issue.assignedTeam || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontWeight: 600 }}>▲ {issue.upvotes}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(issue)}>Edit</button>
                        {issue.status !== 'Resolved' && (
                          <button className="btn btn-success btn-sm" onClick={() => quickStatus(issue.id, 'Resolved')}>✓ Resolve</button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(issue.id)}
                          disabled={deleting === issue.id}
                        >{deleting === issue.id ? '...' : '✕'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal animate-fade-up" style={{ maxWidth: 520 }}>
            <div className="modal__accent-line" style={{ background: 'var(--accent-cyan)' }} />
            <div className="modal__header">
              <div className="modal__icon">⚙</div>
              <div className="modal__header-info">
                <span className="modal__category">Admin Action</span>
                <h2 className="modal__title" style={{ fontSize: '1rem' }}>{editing.title}</h2>
              </div>
              <button className="modal__close" onClick={() => setEditing(null)}>×</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Team</label>
                <select className="form-select" value={form.assignedTeam} onChange={(e) => setForm((p) => ({ ...p, assignedTeam: e.target.value }))}>
                  <option value="">— Unassigned —</option>
                  {TEAMS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Remarks</label>
                <textarea className="form-textarea" rows={3} placeholder="Add notes, action taken, instructions..."
                  value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} />
              </div>

              {/* Preview badges */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                <span className={`status-badge status-${form.status.replace(/\s+/g,'-')}`}>{form.status}</span>
                {form.assignedTeam && <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>→ {form.assignedTeam}</span>}
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
