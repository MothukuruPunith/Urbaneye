import React, { useState } from 'react';
import './ReportIssue.css';
import API_BASE from '../api';

const CATEGORIES = ['Garbage Dump', 'Water Leakage', 'Potholes', 'Street Light Failure', 'Sewage Overflow', 'Broken Roads'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const AREAS = ['Adyar', 'T Nagar', 'Sholinganallur', 'Kodambakkam', 'Teynampet', 'Besant Nagar', 'Velachery', 'Porur', 'Anna Nagar', 'Nungambakkam', 'Mylapore', 'Perambur', 'Guindy', 'Chromepet', 'Tambaram'];

const CATEGORY_ICONS = {
  'Garbage Dump': '🗑', 'Water Leakage': '💧', 'Potholes': '🕳',
  'Street Light Failure': '💡', 'Sewage Overflow': '⚠', 'Broken Roads': '🚧',
};

const defaultForm = {
  title: '', description: '', location: '', area: '', category: '', severity: 'Medium', imageUrl: '', reportedBy: '',
};

const ReportIssue = ({ addToast, onNavigate }) => {
  const [form, setForm]       = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);
  const [step, setStep]       = useState(1);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const isStep1Valid = form.title && form.description && form.location && form.area;
  const isStep2Valid = form.category && form.severity;

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(data.data);
        addToast('Issue reported successfully!', 'success');
      } else {
        addToast(data.message || 'Submission failed', 'error');
      }
    } catch {
      addToast('Server error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const priorityColor =
      submitted.priorityScore >= 90 ? '#ff4b6e' :
      submitted.priorityScore >= 75 ? '#ff8c42' :
      submitted.priorityScore >= 55 ? '#fbbf24' : '#00e5a0';

    return (
      <div className="report-success animate-fade-up">
        <div className="success-icon">✓</div>
        <h2 className="success-title">Issue Reported Successfully</h2>
        <p className="success-sub">Your complaint has been registered with the municipal system.</p>

        <div className="success-card glass-card">
          <div className="success-row">
            <span className="success-label">Issue ID</span>
            <span className="success-val mono">{submitted.id}</span>
          </div>
          <div className="success-row">
            <span className="success-label">Category</span>
            <span className="success-val">{submitted.category}</span>
          </div>
          <div className="success-row">
            <span className="success-label">Severity</span>
            <span className={`severity-badge severity-${submitted.severity}`}>{submitted.severity}</span>
          </div>
          <div className="success-row">
            <span className="success-label">Status</span>
            <span className="status-badge status-Reported">Reported</span>
          </div>
          <div className="success-row">
            <span className="success-label">Priority Score</span>
            <span style={{ color: priorityColor, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              {submitted.priorityScore}/100
            </span>
          </div>
        </div>

        <p className="success-note">
          Track your issue in the <strong>Issue Feed</strong>. You will be notified on status updates.
        </p>

        <div className="success-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('issues')}>
            View All Issues
          </button>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(null); setForm(defaultForm); setStep(1); }}>
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Report a Civic Issue</h1>
          <p className="page-subtitle">Help your city by reporting infrastructure problems</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="report-steps">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`step-item ${step >= s ? 'step-item--active' : ''} ${step > s ? 'step-item--done' : ''}`}>
              <div className="step-num">{step > s ? '✓' : s}</div>
              <div className="step-label">
                {s === 1 ? 'Issue Details' : s === 2 ? 'Classification' : 'Review & Submit'}
              </div>
            </div>
            {s < 3 && <div className={`step-line ${step > s ? 'step-line--done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="report-layout">
        {/* Form */}
        <div className="glass-card report-form-card">

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="form-step animate-fade-up">
              <h3 className="form-step-title">Step 1: Describe the Issue</h3>

              <div className="form-group">
                <label className="form-label">Issue Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Illegal garbage dump near Adyar bridge" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} />
                <span className="char-count">{form.title.length}/120</span>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe the issue in detail – size, impact on residents, duration, etc." value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Exact Location *</label>
                  <input type="text" className="form-input" placeholder="e.g. Near Adyar Bridge, Bus Stop 23" value={form.location} onChange={(e) => set('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Zone *</label>
                  <select className="form-select" value={form.area} onChange={(e) => set('area', e.target.value)}>
                    <option value="">Select Area...</option>
                    {AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Name / ID (optional)</label>
                <input type="text" className="form-input" placeholder="Citizen name or anonymous" value={form.reportedBy} onChange={(e) => set('reportedBy', e.target.value)} />
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}>
                Continue to Classification →
              </button>
            </div>
          )}

          {/* STEP 2: Classification */}
          {step === 2 && (
            <div className="form-step animate-fade-up">
              <h3 className="form-step-title">Step 2: Classify the Issue</h3>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`category-btn ${form.category === cat ? 'category-btn--active' : ''}`}
                      onClick={() => set('category', cat)}
                    >
                      <span className="cat-icon">{CATEGORY_ICONS[cat]}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level *</label>
                <div className="severity-selector">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev}
                      className={`severity-btn ${form.severity === sev ? 'severity-btn--active' : ''} severity-btn--${sev.toLowerCase()}`}
                      onClick={() => set('severity', sev)}
                    >{sev}</button>
                  ))}
                </div>
                <div className="severity-hint">
                  {form.severity === 'Critical' && '🔴 Life/safety risk – immediate municipal response required'}
                  {form.severity === 'High'     && '🟠 Major disruption – urgent repair or removal needed'}
                  {form.severity === 'Medium'   && '🟡 Moderate issue – schedule within a week'}
                  {form.severity === 'Low'      && '🟢 Minor issue – routine maintenance queue'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input type="text" className="form-input" placeholder="https://example.com/photo.jpg" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
              </div>

              {form.imageUrl && (
                <div className="image-preview">
                  <img src={form.imageUrl} alt="Preview" onError={(e) => e.target.style.display='none'} />
                  <span>Image Preview</span>
                </div>
              )}

              <div className="form-nav-btns">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!isStep2Valid} onClick={() => setStep(3)}>Review Submission →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="form-step animate-fade-up">
              <h3 className="form-step-title">Step 3: Review & Submit</h3>
              <div className="review-grid">
                <div className="review-cell"><span className="review-label">Title</span><span className="review-val">{form.title}</span></div>
                <div className="review-cell"><span className="review-label">Location</span><span className="review-val">📍 {form.location}, {form.area}</span></div>
                <div className="review-cell"><span className="review-label">Category</span><span className="review-val">{CATEGORY_ICONS[form.category]} {form.category}</span></div>
                <div className="review-cell"><span className="review-label">Severity</span><span className={`severity-badge severity-${form.severity}`}>{form.severity}</span></div>
                <div className="review-cell" style={{ gridColumn: '1 / -1' }}><span className="review-label">Description</span><span className="review-val">{form.description}</span></div>
                {form.reportedBy && <div className="review-cell"><span className="review-label">Reported By</span><span className="review-val">{form.reportedBy}</span></div>}
              </div>
              <div className="form-nav-btns">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Edit</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : '✓ Submit Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="report-info-panel">
          <div className="glass-card report-info-card">
            <h4 className="report-info-title">Severity Guide</h4>
            <div className="severity-guide">
              {[
                { sev: 'Critical', desc: 'Life risk, road blocked, water main burst' },
                { sev: 'High',     desc: 'Major issue affecting many residents' },
                { sev: 'Medium',   desc: 'Significant but not immediately dangerous' },
                { sev: 'Low',      desc: 'Minor annoyance, cosmetic issue' },
              ].map(({ sev, desc }) => (
                <div key={sev} className="guide-item">
                  <span className={`severity-badge severity-${sev}`}>{sev}</span>
                  <span className="guide-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card report-info-card">
            <h4 className="report-info-title">Smart Priority Engine</h4>
            <p className="report-info-text">
              Our system automatically calculates a <strong>priority score</strong> based on severity, area hotspot frequency, similar complaint clusters, and time pending.
            </p>
            <div className="priority-factors">
              {['Severity Level (+40pts)', 'Area Frequency (+20pts)', 'Category Recurrence (+20pts)', 'Time Pending (+20pts)'].map((f) => (
                <div key={f} className="priority-factor">✦ {f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
