import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  showClose?: boolean;
}

export default function GlassModal({
  open, onClose, title, children, width = 'max-w-lg', showClose = true,
}: GlassModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, handleEsc]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className={`relative ${width} w-full bg-elevated border border-glass-border rounded-2xl shadow-glass-elevated overflow-hidden`}
            style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-glass-border">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-glass transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                )}
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
