import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm max-w-md backdrop-blur-xl ${
          isSuccess
            ? 'bg-slate-900/90 text-white border-emerald-500/40 shadow-emerald-500/10'
            : 'bg-slate-900/90 text-white border-rose-500/40 shadow-rose-500/10'
        }`}
      >
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 font-medium pr-1">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
