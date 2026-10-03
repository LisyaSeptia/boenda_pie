import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKeyDown);

    // Lock background scroll when modal is open
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore scroll position on close
      const top = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (top) window.scrollTo(0, -parseInt(top || '0'));
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,44,30,0.3)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: 560,
          background: 'white', borderRadius: 24, padding: 24,
          border: '1.5px solid #f8cee8', zIndex: 10,
          boxShadow: '0 20px 60px rgba(248,206,232,0.25), 0 4px 20px rgba(0,0,0,0.08)'
        }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1.5px solid #fff4e7' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#3d2c1e', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{
              padding: 6, borderRadius: 10, background: '#fff4e7', border: '1px solid #ffdbb5',
              cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9a4a00',
              transition: 'background 0.15s'
            }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
