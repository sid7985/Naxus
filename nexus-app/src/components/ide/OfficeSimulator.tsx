
import { useRpgStore } from '../../stores/rpgStore';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_COLORS = {
  manager: '#a855f7',
  coder: '#3b82f6',
  designer: '#f59e0b',
  tester: '#ef4444',
  researcher: '#8b5cf6',
  marketer: '#10b981',
};

export default function OfficeSimulator() {
  const agentsMap = useRpgStore(s => s.agents);
  const agents = Object.values(agentsMap);

  return (
    <div className="w-full h-full relative overflow-hidden bg-void border border-glass-border rounded-xl shadow-2xl shrink-0 group">
      {/* Background Pixel Art Office */}
      <img 
        src="/office.png" 
        alt="NEXUS Office" 
        className="absolute w-full h-full object-cover opacity-40 mix-blend-screen transition-opacity duration-1000 group-hover:opacity-60"
      />
      
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />
      
      {/* Agents floating above */}
      {agents.map(agent => (
        <motion.div
          key={agent.role}
          initial={{ x: `${agent.position.x}%`, y: `${agent.position.y}%` }}
          animate={{ x: `${agent.position.x}%`, y: `${agent.position.y}%` }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute w-3 h-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 ring-2 ring-white/10 ring-offset-1 ring-offset-transparent"
          style={{ backgroundColor: AGENT_COLORS[agent.role] }}
        >
          <AnimatePresence>
            {agent.speechBubbles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full mb-2 bg-white/90 backdrop-blur-md text-black font-mono text-[9px] px-2.5 py-1.5 rounded-lg max-w-[120px] shadow-xl truncate truncate z-20"
              >
                {agent.speechBubbles[0].text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-white/90" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <div className="absolute top-2 left-3 z-30">
         <span className="text-[9px] uppercase tracking-widest text-text-muted font-mono px-2 py-0.5 rounded border border-white/10 bg-black/40 backdrop-blur-xl">Office Simulator (RPG Engine)</span>
      </div>
    </div>
  );
}
