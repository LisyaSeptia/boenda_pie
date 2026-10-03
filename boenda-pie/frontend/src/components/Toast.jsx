import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const typeStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-100/50',
    error: 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-100/50',
    info: 'bg-amber-50 text-amber-800 border-amber-200 shadow-amber-100/50'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-600 shrink-0" />
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl transition-all duration-300 max-w-sm sm:max-w-md ${typeStyles[type] || typeStyles.info}`}
      style={{
        animation: 'slideInTop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        backdropFilter: 'blur(8px)',
      }}
    >
      {icons[type]}
      <p className="text-sm font-semibold pr-2 leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-auto shrink-0"
          aria-label="Tutup"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      )}
      <style>{`
        @keyframes slideInTop {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
