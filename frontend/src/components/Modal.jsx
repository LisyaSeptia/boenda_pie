import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl', showCloseButton = true }) => {
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

  const getMaxWidth = () => {
    if (typeof maxWidth === 'number') return maxWidth;
    if (maxWidth === 'max-w-sm') return 380;
    if (maxWidth === 'max-w-md') return 460;
    if (maxWidth === 'max-w-lg') return 520;
    if (maxWidth === 'max-w-2xl') return 680;
    if (maxWidth === 'max-w-3xl') return 768;
    return 560;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,44,30,0.3)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: getMaxWidth(),
          background: 'white', borderRadius: 24, padding: 24,
          border: '1.5px solid #f8cee8', zIndex: 10,
          boxShadow: '0 20px 60px rgba(248,206,232,0.25), 0 4px 20px rgba(0,0,0,0.08)'
        }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1.5px solid #fff4e7' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#3d2c1e', margin: 0 }}>{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onClose) onClose();
                }}
                style={{
                  padding: 6, borderRadius: 10, background: '#fff4e7', border: '1px solid #ffdbb5',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9a4a00',
                  transition: 'all 0.15s ease'
                }}
                className="hover:bg-[#ffe5c7] hover:border-[#f0a3d0] active:scale-90"
                title="Tutup (Esc)"
                aria-label="Tutup"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
