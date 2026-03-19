import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AgentSprite from '../components/rpg/AgentSprite';
import { useRpgStore } from '../stores/rpgStore';
import { useAgentStore } from '../stores/agentStore';
import { DEFAULT_AGENTS } from '../lib/constants';
import type { AgentRole } from '../lib/types';
import '../styles/rpg.css';

export default function RPGWorldPage() {
  const navigate = useNavigate();
  const activeQuest = useRpgStore(s => s.activeQuest);
  
  // Check if any agent is currently active/processing
  const agents = useAgentStore(s => s.agents);
  const isExecuting = Object.values(agents).some(a => a.status === 'acting' || a.status === 'thinking');

  // Keyboard shortcut (⌘G) to toggle back to dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'g') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="rpg-world h-screen w-screen overflow-hidden relative">
      
      {/* TOP HUD: Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
        
        <button 
          onClick={() => navigate('/')}
          className="pointer-events-auto bg-void-light/80 backdrop-blur border border-glass-border rounded-lg p-2 text-text-muted hover:text-white hover:border-text-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Quest Tracker Panel */}
        {activeQuest && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rpg-panel pointer-events-auto p-4 min-w-[300px]"
          >
            <h3 className="text-yellow-400 font-bold mb-1 text-sm flex items-center gap-2">
              <span className="text-lg">📜</span> [QUEST] {activeQuest.id}
            </h3>
            <p className="text-white text-xs mb-3">{activeQuest.description}</p>
            
            <div className="space-y-2">
              {activeQuest.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-3 h-3 rounded-full border border-glass-border flex items-center justify-center ${
                    task.status === 'completed' ? 'bg-status-done border-status-done text-void' : 
                    task.status === 'active' ? 'border-status-inProgress text-status-inProgress animate-pulse' : 
                    'bg-void'
                  }`}>
                    {task.status === 'completed' && '✓'}
                  </span>
                  <span className="text-text-muted font-mono w-20">[{task.agentId.toUpperCase()}]</span>
                  <span className={task.status === 'completed' ? 'text-text-muted line-through' : 'text-text-secondary'}>
                    {task.description}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* The Office Scene Grid Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Draw desk/station markers on the floor */}
        {DEFAULT_AGENTS.map((agent) => {
          const pos = useRpgStore.getState().agents[agent.role as AgentRole].position;
          return (
            <div 
              key={`desk-${agent.role}`}
              className="absolute w-24 h-12 border-2 border-white/5 rounded-[50%] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="text-[8px] font-mono text-white/20 tracking-wider">
                {agent.role.toUpperCase()} STATION
              </div>
            </div>
          );
        })}
      </div>

      {/* The Agents Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {DEFAULT_AGENTS.map((agent) => (
          <AgentSprite key={agent.id} role={agent.role as AgentRole} />
        ))}
      </div>

      {/* BOTTOM HUD: Action Bar UI overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl px-4">
        <div className="rpg-panel p-3 flex items-center gap-3 pointer-events-auto">
          <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-status-inProgress animate-pulse' : 'bg-status-done'}`} />
          <span className="text-xs font-mono text-text-muted">
            {isExecuting ? 'SIMULATION ACTIVE' : 'SYSTEM IDLE'}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[10px] text-text-muted bg-void/50 px-2 py-1 rounded">
            <kbd className="font-mono">⌘G</kbd> to exit
          </div>
        </div>
      </div>
    </div>
  );
}
