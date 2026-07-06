import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full sm:w-[380px] pointer-events-none"
        role="live"
        aria-live="assertive"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-lg
              animate-fade-in transition-all duration-300 ease-out transform translate-y-0
              ${toast.type === 'success' ? 'border-emerald-500/20 dark:border-emerald-500/10' : ''}
              ${toast.type === 'error' ? 'border-red-500/20 dark:border-red-500/10' : ''}
              ${toast.type === 'info' ? 'border-indigo-500/20 dark:border-indigo-500/10' : ''}
            `}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse-slow" />
              )}
              {toast.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse-slow" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-indigo-500 animate-pulse-slow" />
              )}
            </div>

            {/* Message */}
            <div className="flex-grow">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
