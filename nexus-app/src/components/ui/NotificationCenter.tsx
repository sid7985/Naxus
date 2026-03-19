import { useEffect, useState } from 'react';
import { eventBus } from '../../services/eventBus';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read: boolean;
}

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = eventBus.on('notification:add', ({ title, body, type }) => {
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, title, body, type: type as any, timestamp: Date.now(), read: false },
        ...prev.slice(0, 49), // cap at 50
      ]);
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-xl hover:bg-glass transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-4 h-4 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-80 z-50"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
          >
            <GlassPanel elevated className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
                <h3 className="text-xs font-semibold">Notifications</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-glass">
                  <X className="w-3 h-3 text-text-muted" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">No notifications yet</div>
                ) : (
                  notifications.map((n) => {
                    const config = TYPE_CONFIG[n.type];
                    const Icon = config.icon;
                    return (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-glass-border/30 ${!n.read ? 'bg-glass/30' : ''}`}>
                        <div className={`p-1.5 rounded-lg ${config.bg} shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{n.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[9px] text-text-muted/50 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
