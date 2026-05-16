# 🏙️ UrbanEye – Illegal Waste Dump & Civic Issue Intelligence Platform

> A professional smart-city SaaS platform for municipal authorities to monitor, track, and resolve civic infrastructure issues reported by citizens.

---

## 📸 Platform Overview

UrbanEye is a full-stack civic intelligence platform that enables:
- **Citizens** to report illegal garbage dumps, potholes, water leaks, and other civic issues with location tags, severity levels, and photo URLs.
- **Municipal authorities** to monitor hotspots, track resolution efficiency, assign field teams, and analyze trends through an analytics dashboard.

---

## 🗂️ Folder Structure

```
urbaneye/
│
├── backend/
│   ├── server.js              ← Express API server (all routes + Smart Priority Engine)
│   ├── data/
│   │   └── issues.json        ← JSON file storage (10 sample issues pre-loaded)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html         ← HTML shell with Google Fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js / Sidebar.css      ← Navigation sidebar
│   │   │   ├── Header.js / Header.css        ← Top header bar
│   │   │   ├── StatCard.js / StatCard.css    ← Animated KPI cards
│   │   │   ├── IssueCard.js / IssueCard.css  ← Heatmap-style issue cards
│   │   │   ├── IssueModal.js / IssueModal.css← Issue detail modal
│   │   │   └── Toast.js                      ← Notification toasts
│   │   ├── pages/
│   │   │   ├── Dashboard.js / Dashboard.css  ← Main municipal dashboard
│   │   │   ├── Issues.js / Issues.css        ← Issue feed with filters
│   │   │   ├── ReportIssue.js / ReportIssue.css ← 3-step report form
│   │   │   ├── Analytics.js / Analytics.css  ← Charts and metrics
│   │   │   ├── Hotspots.js / Hotspots.css    ← Area heatmap analysis
│   │   │   └── Admin.js / Admin.css          ← Admin management panel
│   │   ├── styles/
│   │   │   └── global.css                    ← Design system & global styles
│   │   ├── App.js                            ← Root app with routing & toast system
│   │   └── index.js                          ← React entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+ installed
- npm v8+ installed
- Two terminal windows

---

### Step 1: Clone / Download the Project

```bash
# If downloaded as zip, extract it:
cd urbaneye
```

---

### Step 2: Install & Run Backend

```bash
# Terminal 1 – Backend
cd urbaneye/backend
npm install
node server.js
```

✅ Backend runs at: **http://localhost:5000**

You should see:
```
🏙️  UrbanEye API Server running on http://localhost:5000
📊  Analytics: http://localhost:5000/analytics
🗂️   Issues:    http://localhost:5000/issues
```

---

### Step 3: Install & Run Frontend

```bash
# Terminal 2 – Frontend
cd urbaneye/frontend
npm install
npm start
```

✅ Frontend opens at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in frontend/package.json automatically routes all API calls to the backend — no CORS issues.

---

## 🔗 REST API Reference

| Method | Endpoint          | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/issues`         | Get all issues (supports filters)  |
| GET    | `/issues/:id`     | Get single issue by ID             |
| POST   | `/issues`         | Create a new issue                 |
| PUT    | `/issues/:id`     | Update status/team/remarks         |
| DELETE | `/issues/:id`     | Delete an issue                    |
| GET    | `/analytics`      | Full analytics data for dashboard  |
| GET    | `/health`         | Health check                       |

### Filter Parameters (GET /issues)
```
?category=Potholes
?severity=Critical
?status=Reported
?area=Adyar
?search=garbage
```

### POST /issues – Request Body
```json
{
  "title": "Illegal Garbage Dump Near School",
  "description": "Large waste dump near Vidya School entrance",
  "location": "Near Vidya School, Main Road",
  "area": "Anna Nagar",
  "category": "Garbage Dump",
  "severity": "High",
  "imageUrl": "https://example.com/photo.jpg",
  "reportedBy": "Citizen #1234"
}
```

### PUT /issues/:id – Updatable Fields
```json
{
  "status": "Assigned",
  "assignedTeam": "Zone A Sanitation",
  "remarks": "Team dispatched at 14:00",
  "severity": "Critical",
  "upvotes": 42
}
```

---

## 🧠 Smart Priority Engine – How It Works

Every issue receives a **priority score (0–100)** calculated in real-time:

```
Priority Score = Severity Weight  (max 40pts)
               + Area Frequency   (max 20pts)
               + Category Cluster (max 20pts)
               + Time Pending     (max 20pts)
               = capped at 100
```

| Score Range | Label                             |
|-------------|-----------------------------------|
| 90–100      | CRITICAL – Immediate Action       |
| 75–89       | High Priority – Urgent Response   |
| 55–74       | Medium Priority – Schedule Soon   |
| 0–54        | Low Priority – Routine Queue      |

**Example:** A pothole reported in an area that already has 3 unresolved issues, marked Critical, pending 5 days → score of 93 → "CRITICAL – Immediate Action Required"

---

## 🎨 UI Features

| Feature | Description |
|---------|-------------|
| Dark glassmorphism | `backdrop-filter: blur(20px)` cards with subtle borders |
| Heatmap issue cards | Left edge colour strip reflects priority (red → green) |
| Animated stat cards | Count-up animation with glow on hover |
| 3-step report form | Wizard-style form with preview and validation |
| Priority bars | Dynamic coloured progress bars per issue |
| Recharts integration | Line, Bar, Pie, Radar charts in Analytics |
| Interactive heatmap | Area × Category matrix with colour intensity |
| Toast notifications | Slide-in success/error/info notifications |
| Responsive layout | Works on desktop, tablet, and mobile |

---

## 📊 Sample Data

10 pre-loaded issues covering:
- **Adyar** – Illegal garbage dump (Critical)
- **T Nagar** – Sewage overflow (High)
- **Sholinganallur** – Deep pothole on OMR (High)
- **Kodambakkam** – 12 street lights failed (Medium)
- **Teynampet** – Water pipeline burst (Critical → Resolved)
- **Besant Nagar** – Broken ECR road (High)
- **Velachery** – Overflowing bins near bus terminus (Medium)
- **Porur** – Pothole cluster near hospital (Critical)
- **Anna Nagar** – Water leakage from underground pipe (Medium → Resolved)
- **Nungambakkam** – Illegal dump near school zone (High)

---

## 🚀 Future Enhancements

1. **Real GPS Map Integration** – Leaflet.js or Google Maps for visual issue mapping
2. **Image Upload** – Multer-based file upload instead of URL input
3. **JWT Authentication** – Role-based login (Citizen vs Admin)
4. **Push Notifications** – SMS/email alerts when status changes
5. **AI Category Detection** – Auto-classify issue from image using Vision API
6. **Offline Support** – PWA with service workers for mobile field reporting
7. **Export Reports** – PDF/Excel generation for monthly municipal reports
8. **Multi-city Support** – Tenant-based architecture for multiple municipalities
9. **Mobile App** – React Native companion app for field officers
10. **Real-time Updates** – Socket.io for live dashboard feed

---

## 📄 Resume-Ready Project Description

```
UrbanEye – Smart City Civic Intelligence Platform                    [2024]
Full-Stack Web Application | React.js · Node.js · Express.js · REST API

• Built an end-to-end smart-city platform enabling citizens to report civic 
  issues (illegal dumps, potholes, water leaks) with location tagging and 
  severity classification, used by municipal authorities for real-time monitoring.

• Designed a Smart Priority Engine that auto-calculates issue urgency scores 
  (0–100) using severity, area frequency, category clustering, and time-pending 
  factors — reducing manual triage effort.

• Developed 6 REST API endpoints with Express.js using JSON file storage (fs 
  module), supporting filtering, sorting, analytics aggregation, and CRUD.

• Built an Analytics Dashboard with Recharts (line, bar, pie, radar charts) 
  showing monthly trends, resolution rates, department workload, and hotspot maps.

• Implemented a heatmap-style Area × Category matrix to identify recurring 
  problem zones and drive data-driven municipal resource allocation.

• Designed a premium glassmorphism dark UI with animated stat cards, 3-step 
  report wizard, status-based workflows, and mobile-responsive layout.

Tech: React.js, Node.js, Express.js, Recharts, CSS3 (Glassmorphism), REST API
```

---

## 🎙️ Interview Explanation

### "Tell me about this project"
> "UrbanEye is a civic issue reporting and analytics platform I built to simulate how modern municipalities can replace phone-based complaint systems with a structured, data-driven platform. Citizens submit geo-tagged reports with severity levels, and the system automatically calculates a priority score using a custom algorithm. Municipal admins then use the dashboard to monitor hotspots, track resolutions, and analyze trends through interactive charts."

### "What was technically challenging?"
> "The Smart Priority Engine was interesting — it's not just about severity, but about combining four weighted factors in real-time including area hotspot frequency. Every GET /issues request recalculates scores dynamically based on the current state of all issues, so the priority adapts as new complaints come in from the same area."

### "Why JSON file storage instead of a database?"
> "For this project scope, JSON + fs module keeps the setup zero-dependency and instantly runnable. The architecture is already structured so swapping in MongoDB would just replace readIssues() and writeIssues() helper functions — the API contracts stay identical."

### "How would you scale this?"
> "Replace JSON storage with MongoDB Atlas. Add Redis caching for analytics queries. Add Socket.io for real-time dashboard updates. Implement JWT auth with role separation (Citizen, Field Officer, Admin, Super Admin). Deploy on AWS with a CDN for the React build."

---

## 🛠️ Skills Demonstrated

| Category | Skills |
|----------|--------|
| Frontend | React.js (functional components, hooks), CSS3, Glassmorphism UI, Recharts, Responsive Design |
| Backend  | Node.js, Express.js, REST API design, File I/O (fs module), CORS, JSON parsing |
| Logic    | Custom scoring algorithm, dynamic filtering, analytics aggregation |
| UX/UI    | Multi-step forms, toast notifications, modal dialogs, heatmaps, data visualisation |
| Dev      | Component architecture, props passing, useEffect data fetching, error handling |

---

*Built with ❤️ for smart cities | UrbanEye v2.4.1 | Dept. of Urban Development*
