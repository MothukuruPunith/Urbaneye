import React, { useState, useCallback } from 'react';
import './styles/global.css';

import Sidebar    from './components/Sidebar';
import Header     from './components/Header';
import Toast      from './components/Toast';

import Dashboard  from './pages/Dashboard';
import Issues     from './pages/Issues';
import ReportIssue from './pages/ReportIssue';
import Analytics  from './pages/Analytics';
import Hotspots   from './pages/Hotspots';
import Admin      from './pages/Admin';

let toastId = 0;

function App() {
  const [activePage, setActivePage]   = useState('dashboard');
  const [toasts, setToasts]           = useState([]);
  const [issueCount, setIssueCount]   = useState(0);

  // ── Toast system ──────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Render active page ─────────────────────────────────────
  const renderPage = () => {
    const props = { addToast, onNavigate: setActivePage };
    switch (activePage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'issues':    return <Issues    {...props} />;
      case 'report':    return <ReportIssue {...props} />;
      case 'analytics': return <Analytics {...props} />;
      case 'hotspots':  return <Hotspots  {...props} />;
      case 'admin':     return <Admin     {...props} />;
      default:          return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        issueCount={issueCount}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <Header activePage={activePage} onNavigate={setActivePage} />

        {/* Page Content */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
