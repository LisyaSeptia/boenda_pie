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
      {/* Non-spinning subtle pulse indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0a3d0' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7dcef5' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5d96b' }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: 0 }}>{text}</p>
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

