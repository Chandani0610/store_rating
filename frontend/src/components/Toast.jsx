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
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-md ${
          isSuccess
            ? 'bg-emerald-900/90 text-white border-emerald-700/50 backdrop-blur'
            : 'bg-rose-900/90 text-white border-rose-700/50 backdrop-blur'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0" />
        )}
        <div className="flex-1 font-medium">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white rounded-md p-0.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
