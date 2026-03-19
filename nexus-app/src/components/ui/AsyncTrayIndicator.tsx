import { motion, AnimatePresence } from 'framer-motion';
import { useMissionQueueStore } from '../../stores/missionQueueStore';
import { Loader2, Sparkles } from 'lucide-react';

export default function AsyncTrayIndicator() {
  const { queue } = useMissionQueueStore();

  const activeMissions = queue.filter(m => m.status === 'pending' || m.status === 'running');
  const count = activeMissions.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-void/80 backdrop-blur-xl border border-agent-coder/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden relative group cursor-pointer"
               onClick={() => window.location.href = '/computer'}>
             
            {/* Ping animation element */}
            <div className="absolute inset-0 bg-agent-coder/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full origin-center" />

            <Loader2 className="w-4 h-4 text-agent-coder animate-spin relative z-10" />
            <div className="flex flex-col relative z-10">
              <span className="text-[11px] font-mono text-white tracking-wider">
                {count} BACKGROUND TASK{count === 1 ? '' : 'S'}
              </span>
              <span className="text-[9px] text-agent-coder uppercase truncate max-w-[150px]">
                {activeMissions[0].prompt}
              </span>
            </div>
            <Sparkles className="w-3 h-3 text-agent-coder/50 relative z-10" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
