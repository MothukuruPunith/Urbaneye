import React, { useEffect } from 'react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className={`toast toast-${toast.type}`}>
      <span style={{ fontSize: '1rem' }}>{icons[toast.type] || 'ℹ'}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
      >×</button>
    </div>
  );
};

export default Toast;
