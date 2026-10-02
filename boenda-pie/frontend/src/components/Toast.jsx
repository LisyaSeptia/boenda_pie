import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 icon-emerald',
    error: 'bg-rose-50 text-rose-800 border-rose-200 icon-rose',
    info: 'bg-amber-50 text-amber-800 border-amber-200 icon-amber'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-600 shrink-0" />
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all animate-bounce-in max-w-md ${typeStyles[type] || typeStyles.info}`}>
      {icons[type]}
      <p className="text-sm font-medium pr-2">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      )}
    </div>
  );
};

export default Toast;
