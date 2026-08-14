"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((item) => (
            <ToastItem key={item.id} toast={item} onRemove={removeToast} />
          ))}
        </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      role="status"
      className="px-4 py-2 font-mono text-xs tracking-wider bg-base border border-line"
    >
      <span className="text-ink-muted">
        {toast.type === "error" ? t.ui.errorPrefix : "OK:"}
      </span>{" "}
      <span className="text-ink-secondary uppercase">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-ink-muted hover:opacity-70"
        aria-label={t.ui.dismiss}
      >
        [×]
      </button>
    </motion.div>
  );
}
