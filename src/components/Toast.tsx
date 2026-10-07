'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-start space-x-3 p-4 rounded-2xl border shadow-xl bg-white max-w-sm ${
          isSuccess
            ? 'border-emerald-300 text-slate-800'
            : isError
            ? 'border-red-300 text-slate-800'
            : isWarning
            ? 'border-amber-300 text-slate-800'
            : 'border-sky-300 text-slate-800'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
          {isWarning && <AlertCircle className="w-5 h-5 text-amber-600" />}
          {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-600" />}
        </div>
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
          {toast.message && <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 shrink-0 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
