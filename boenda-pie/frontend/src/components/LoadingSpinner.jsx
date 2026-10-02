import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Memuat data...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-amber-700">
      <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-3" />
      <p className="text-sm font-medium text-slate-600">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
