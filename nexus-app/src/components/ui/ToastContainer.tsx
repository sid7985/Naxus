// ===== NEXUS Toast Notification System =====
// Global toast notifications with auto-dismiss, multiple types, and stacking

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, XCircle, Info, X
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const TYPE_CONFIG: Record<ToastType, { icon: React.ElementType; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  error:   { icon: XCircle,      color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.1)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  info:    { icon: Info,          color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = TYPE_CONFIG[toast.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-xl"
              style={{
                background: 'rgba(15, 15, 25, 0.92)',
                border: `1px solid ${cfg.color}30`,
                boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${cfg.color}10`,
              }}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{toast.title}</div>
                {toast.message && (
                  <div className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded hover:bg-glass transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
