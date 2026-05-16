/**
 * UrbanEye – Civic Intelligence Platform
 * Backend API Server
 * Node.js + Express.js + JSON File Storage
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000; // Render sets PORT automatically

// ── Middleware ──────────────────────────────────────────────────────────────
// Allow requests from any origin (Vercel frontend, local dev, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Path to JSON data file
const DATA_FILE = path.join(__dirname, 'data', 'issues.json');

// ── Helper: Read issues from JSON file ─────────────────────────────────────
const readIssues = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading issues file:', err.message);
    return [];
  }
};

// ── Helper: Write issues to JSON file ──────────────────────────────────────
const writeIssues = (issues) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing issues file:', err.message);
    return false;
  }
};

// ── Smart Priority Engine ───────────────────────────────────────────────────
/**
 * Calculates a priority score (0–100) for an issue based on:
 * - Severity level
 * - Area frequency (how many issues exist in same area)
 * - Similar complaint count (same category in same area)
 * - Time pending (older unresolved = higher priority)
 */
const calculatePriority = (issue, allIssues) => {
  let score = 0;

  // 1. Severity weight (max 40 pts)
  const severityMap = { Critical: 40, High: 30, Medium: 20, Low: 10 };
  score += severityMap[issue.severity] || 10;

  // 2. Area frequency (max 20 pts) – how "hot" is this zone
  const areaCount = allIssues.filter(
    (i) => i.area === issue.area && i.status !== 'Resolved'
  ).length;
  score += Math.min(areaCount * 4, 20);

  // 3. Category recurrence in same area (max 20 pts)
  const categoryCount = allIssues.filter(
    (i) => i.category === issue.category && i.area === issue.area && i.status !== 'Resolved'
  ).length;
  score += Math.min(categoryCount * 5, 20);

  // 4. Time pending – unresolved issues older than 3 days get extra weight (max 20 pts)
  if (issue.status !== 'Resolved') {
    const createdAt = new Date(issue.createdAt);
    const daysPending = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    score += Math.min(daysPending * 3, 20);
  }

  return Math.min(score, 100);
};

// ── Priority Label ──────────────────────────────────────────────────────────
const getPriorityLabel = (score) => {
  if (score >= 90) return 'CRITICAL – Immediate Action Required';
  if (score >= 75) return 'High Priority – Urgent Response Needed';
  if (score >= 55) return 'Medium Priority – Schedule Soon';
  return 'Low Priority – Routine Queue';
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── GET /issues – Fetch all issues with optional filters ───────────────────
app.get('/issues', (req, res) => {
  try {
    let issues = readIssues();

    const { area, category, severity, status, search } = req.query;

    if (area) issues = issues.filter((i) => i.area.toLowerCase().includes(area.toLowerCase()));
    if (category) issues = issues.filter((i) => i.category === category);
    if (severity) issues = issues.filter((i) => i.severity === severity);
    if (status) issues = issues.filter((i) => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      );
    }

    // Recalculate priority scores dynamically
    const allIssues = readIssues();
    issues = issues.map((issue) => ({
      ...issue,
      priorityScore: calculatePriority(issue, allIssues),
      priorityLabel: getPriorityLabel(calculatePriority(issue, allIssues)),
    }));

    // Sort by priority score descending
    issues.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── GET /issues/:id – Fetch single issue ───────────────────────────────────
app.get('/issues/:id', (req, res) => {
  try {
    const issues = readIssues();
    const issue = issues.find((i) => i.id === req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({
      success: true,
      data: {
        ...issue,
        priorityScore: calculatePriority(issue, issues),
        priorityLabel: getPriorityLabel(calculatePriority(issue, issues)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── POST /issues – Create new issue ────────────────────────────────────────
app.post('/issues', (req, res) => {
  try {
    const { title, description, location, area, category, severity, imageUrl, reportedBy } = req.body;

    // Basic validation
    if (!title || !description || !location || !area || !category || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, location, area, category, severity',
      });
    }

    const issues = readIssues();
    const newIssue = {
      id: `issue-${uuidv4().split('-')[0]}`,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      area: area.trim(),
      category,
      severity,
      status: 'Reported',
      imageUrl: imageUrl || '',
      reportedBy: reportedBy || 'Anonymous Citizen',
      assignedTeam: null,
      remarks: '',
      priorityScore: 0,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    // Calculate initial priority
    newIssue.priorityScore = calculatePriority(newIssue, issues);

    issues.push(newIssue);
    writeIssues(issues);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: { ...newIssue, priorityLabel: getPriorityLabel(newIssue.priorityScore) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── PUT /issues/:id – Update issue (status, assignment, remarks) ───────────
app.put('/issues/:id', (req, res) => {
  try {
    const issues = readIssues();
    const index = issues.findIndex((i) => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Issue not found' });

    const allowedUpdates = ['status', 'assignedTeam', 'remarks', 'severity', 'upvotes'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Auto-set resolvedAt when status changes to Resolved
    if (updates.status === 'Resolved' && issues[index].status !== 'Resolved') {
      updates.resolvedAt = new Date().toISOString();
    }

    issues[index] = {
      ...issues[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate priority after update
    issues[index].priorityScore = calculatePriority(issues[index], issues);

    writeIssues(issues);
    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: {
        ...issues[index],
        priorityLabel: getPriorityLabel(issues[index].priorityScore),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── DELETE /issues/:id – Delete an issue ───────────────────────────────────
app.delete('/issues/:id', (req, res) => {
  try {
    let issues = readIssues();
    const index = issues.findIndex((i) => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Issue not found' });

    const deleted = issues[index];
    issues = issues.filter((i) => i.id !== req.params.id);
    writeIssues(issues);
    res.json({ success: true, message: 'Issue deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── GET /analytics – Full analytics for dashboard ─────────────────────────
app.get('/analytics', (req, res) => {
  try {
    const issues = readIssues();
    const total = issues.length;

    // Status breakdown
    const statusBreakdown = {
      Reported: issues.filter((i) => i.status === 'Reported').length,
      'Under Review': issues.filter((i) => i.status === 'Under Review').length,
      Assigned: issues.filter((i) => i.status === 'Assigned').length,
      Resolved: issues.filter((i) => i.status === 'Resolved').length,
    };

    // Severity breakdown
    const severityBreakdown = {
      Critical: issues.filter((i) => i.severity === 'Critical').length,
      High: issues.filter((i) => i.severity === 'High').length,
      Medium: issues.filter((i) => i.severity === 'Medium').length,
      Low: issues.filter((i) => i.severity === 'Low').length,
    };

    // Category breakdown
    const categories = ['Garbage Dump', 'Water Leakage', 'Potholes', 'Street Light Failure', 'Sewage Overflow', 'Broken Roads'];
    const categoryBreakdown = categories.map((cat) => ({
      category: cat,
      count: issues.filter((i) => i.category === cat).length,
    }));

    // Area hotspots – top 5 areas with most unresolved issues
    const areaMap = {};
    issues.forEach((issue) => {
      if (!areaMap[issue.area]) areaMap[issue.area] = { total: 0, unresolved: 0, critical: 0 };
      areaMap[issue.area].total++;
      if (issue.status !== 'Resolved') areaMap[issue.area].unresolved++;
      if (issue.severity === 'Critical') areaMap[issue.area].critical++;
    });
    const hotspots = Object.entries(areaMap)
      .map(([area, data]) => ({ area, ...data }))
      .sort((a, b) => b.unresolved - a.unresolved)
      .slice(0, 8);

    // Resolution rate
    const resolutionRate = total > 0 ? Math.round((statusBreakdown.Resolved / total) * 100) : 0;

    // Average resolution time (for resolved issues only, in hours)
    const resolvedIssues = issues.filter((i) => i.resolvedAt);
    const avgResolutionHours =
      resolvedIssues.length > 0
        ? Math.round(
            resolvedIssues.reduce((sum, i) => {
              const created = new Date(i.createdAt);
              const resolved = new Date(i.resolvedAt);
              return sum + (resolved - created) / (1000 * 60 * 60);
            }, 0) / resolvedIssues.length
          )
        : 0;

    // Critical + active count
    const criticalActive = issues.filter(
      (i) => i.severity === 'Critical' && i.status !== 'Resolved'
    ).length;

    // Top upvoted issues (community most concerned)
    const topUpvoted = [...issues]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 5)
      .map(({ id, title, upvotes, category, severity, area }) => ({
        id, title, upvotes, category, severity, area,
      }));

    // Monthly trend (last 6 months simulated from createdAt)
    const monthlyTrend = (() => {
      const months = {};
      const now = new Date();
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        months[key] = 0;
      }
      issues.forEach((i) => {
        const d = new Date(i.createdAt);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (months[key] !== undefined) months[key]++;
      });
      return Object.entries(months).map(([month, count]) => ({ month, count }));
    })();

    res.json({
      success: true,
      data: {
        overview: {
          total,
          active: total - statusBreakdown.Resolved,
          criticalActive,
          resolutionRate,
          avgResolutionHours,
          totalCitizensEngaged: issues.reduce((s, i) => s + i.upvotes, 0),
        },
        statusBreakdown,
        severityBreakdown,
        categoryBreakdown,
        hotspots,
        topUpvoted,
        monthlyTrend,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'UrbanEye API', timestamp: new Date().toISOString() });
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏙️  UrbanEye API Server running on http://localhost:${PORT}`);
  console.log(`📊  Analytics: http://localhost:${PORT}/analytics`);
  console.log(`🗂️   Issues:    http://localhost:${PORT}/issues\n`);
});
