import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../store/toastSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.toast.toasts);

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => dispatch(removeToast(toast.id)), 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  const colors = {
    success: { bg: '#10B981', icon: '✓' },
    error:   { bg: '#EF4444', icon: '✕' },
    warning: { bg: '#F59E0B', icon: '⚠' },
    info:    { bg: '#3B82F6', icon: 'ℹ' },
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(toast => {
        const c = colors[toast.type] || colors.info;
        return (
          <div key={toast.id} style={{
            background: c.bg, color: 'white', padding: '12px 20px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
            gap: '10px', minWidth: '250px', animation: 'slideIn 0.3s ease',
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{c.icon}</span>
            <span>{toast.message}</span>
            <button onClick={() => dispatch(removeToast(toast.id))} style={{
              marginLeft: 'auto', background: 'none', border: 'none', color: 'white',
              cursor: 'pointer', fontSize: '16px', padding: '0 4px'
            }}>×</button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
