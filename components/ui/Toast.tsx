"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useI18n } from "@/components/LocaleProvider";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((previous) => [...previous, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-50 flex flex-col gap-2 left-4 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 pl-4 pr-1 py-1 font-mono text-xs tracking-wider bg-base border border-line rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-fade-in-up"
    >
      <span>
        <span className="text-ink-muted">
          {toast.type === "error" ? t.ui.errorPrefix : "OK:"}
        </span>{" "}
        <span className="text-ink-secondary uppercase">{toast.message}</span>
      </span>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="min-h-11 min-w-11 shrink-0 text-ink-muted hover:opacity-70"
        aria-label={t.ui.dismiss}
      >
        [×]
      </button>
    </div>
  );
}
