"use client";

import { Provider, useDispatch } from "react-redux";
import { store, syncFromBackend } from "../redux/store";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

function SyncManager() {
  const dispatch = useDispatch();
  useEffect(() => {
    syncFromBackend(dispatch);
  }, [dispatch]);
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function Providers({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <Provider store={store}>
      <SyncManager />
      <ToastContext.Provider value={{ addToast }}>
        {children}
        {/* Toast Container */}
        <div className="toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast-item toast-${toast.type} animate-slide-in`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="toast-icon">
                {toast.type === "success" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
                {toast.type === "info" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                )}
                {toast.type === "warning" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                )}
              </div>
              <div className="toast-text">{toast.message}</div>
              <button
                type="button"
                className="toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </Provider>
  );
}
