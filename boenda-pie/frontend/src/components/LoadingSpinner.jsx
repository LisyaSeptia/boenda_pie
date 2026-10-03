import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ text = 'Memuat data...', fullPage = false, delay = 400 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid #f8cee8', borderTopColor: '#f0a3d0', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: '2px solid #beeaff', borderBottomColor: '#7dcef5', animation: 'spin 1.2s linear infinite reverse' }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: 0 }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffaf5' }}>
        {content}
      </div>
    );
  }
  return content;
};

export default LoadingSpinner;

