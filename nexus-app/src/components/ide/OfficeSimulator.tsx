import { useState, useEffect } from 'react';
import { useRpgStore } from '../../stores/rpgStore';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_COLORS: Record<string, string> = {
  manager: '#a855f7',
  coder: '#3b82f6',
  designer: '#f59e0b',
  tester: '#ef4444',
  researcher: '#8b5cf6',
  marketer: '#10b981',
};

// Initial desk positions based on the LargePixelOffice layout
const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
  manager: { x: 15, y: 25 },
  coder: { x: 35, y: 55 },
  designer: { x: 55, y: 35 },
  tester: { x: 75, y: 55 },
  researcher: { x: 25, y: 65 },
  marketer: { x: 65, y: 65 },
};

// Define valid walking bounds dynamically (10% to 90% x, 30% to 80% y)
function getRandomCoordinate() {
  return {
    x: Math.floor(Math.random() * 80) + 10,
    y: Math.floor(Math.random() * 50) + 30,
  };
}

interface AgentPos {
  x: number;
  y: number;
  isWalking: boolean;
}

interface OfficeSimulatorProps {
  isFocused?: boolean;
}

export default function OfficeSimulator({ isFocused = false }: OfficeSimulatorProps) {
  const agentsMap = useRpgStore(s => s.agents);
  const agents = Object.values(agentsMap);

  // Local state to track tamagotchi wandering
  const [positions, setPositions] = useState<Record<string, AgentPos>>(() => {
    const init: Record<string, AgentPos> = {};
    Object.keys(INITIAL_POSITIONS).forEach(role => {
      init[role] = { ...INITIAL_POSITIONS[role], isWalking: false };
    });
    return init;
  });

  // True Tamagotchi Wandering Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => {
        const next = { ...prev };
        // Pick a random agent to move
        const roles = Object.keys(next);
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        
        if (next[randomRole]) {
          // If they are walking, stop them. If they are stopped, walk them.
          if (next[randomRole].isWalking) {
            next[randomRole] = { ...next[randomRole], isWalking: false };
          } else {
            // Decide to either random walk or return to desk 50/50
            const returnToDesk = Math.random() > 0.5;
            const targetPos = returnToDesk ? (INITIAL_POSITIONS[randomRole] || getRandomCoordinate()) : getRandomCoordinate();
            
            next[randomRole] = { 
              ...next[randomRole], 
              x: targetPos.x, 
              y: targetPos.y,
              isWalking: true 
            };
          }
        }
        return next;
      });
    }, 4500); // Trigger a state evaluation every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#1a1a2e] rounded-lg border border-glass-border group transition-all duration-500 ${isFocused ? 'shadow-2xl shadow-agent-manager/20' : ''}`}>
      {/* Background: Real Pixel Art Office */}
      <img 
        src="/sprites/LargePixelOffice.png" 
        alt="NEXUS Pixel Office" 
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Dark gradient overlay for readability of terminals/agents */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void/70" />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_3px]" />

      {/* Agent Character Sprites */}
      {agents.map((agent, idx) => {
        const color = AGENT_COLORS[agent.role] || '#fff';
        const posState = positions[agent.role] || { x: 50, y: 50, isWalking: false };
        
        // Combine global state with local tamagotchi wandering overrides
        let displayState = posState.isWalking ? 'walking' : agent.state;
        
        // Using distinct hue rotation to distinguish roles since we share characters.png
        const hueShift = idx * 60; // 0, 60, 120, 180, 240, 300

        return (
          <motion.div
            key={agent.role}
            className={`absolute flex flex-col items-center z-10 rpg-state-${displayState}`}
            initial={{ left: `${posState.x}%`, top: `${posState.y}%`, opacity: 0, filter: 'blur(8px)' }}
            animate={{ 
              left: `${posState.x}%`, 
              top: `${posState.y}%`, 
              opacity: 1, 
              filter: 'blur(0px)'
            }}
            transition={{ 
              // Walking across screen smoothly
              left: { duration: posState.isWalking ? 4.5 : 0.2, ease: "linear" },
              top: { duration: posState.isWalking ? 4.5 : 0.2, ease: "linear" },
              opacity: { duration: 0.5 },
              filter: { duration: 0.5 }
            }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* Speech Bubble */}
            <AnimatePresence>
              {agent.speechBubbles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.5, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute -top-[45px] bg-white/95 text-black font-mono text-[8px] px-2 py-1 rounded shadow-xl max-w-[120px] truncate z-20 whitespace-nowrap"
                >
                  {agent.speechBubbles[0].text}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-white/95" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Base Drop Shadow */}
            <div className="absolute -bottom-1 w-[24px] h-[8px] bg-black/60 blur-[3px] rounded-[100%]" />

            {/* The High-Quality characters.png Sprite Component mapped in rpg.css */}
            <div 
              className="rpg-sprite"
              style={{ 
                '--glow-color': color,
                filter: `hue-rotate(${hueShift}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.4))` 
              } as any}
            />

            {/* Name Tag */}
            <div 
              className="mt-2 text-[7px] font-mono uppercase tracking-widest px-1.5 py-[1px] rounded-[3px] shadow backdrop-blur-sm"
              style={{ color, background: `${color}15`, border: `1px solid ${color}40`, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
              {agent.role}
            </div>
            
            {/* Minimal Status Dot */}
            <div 
              className={`absolute top-[48px] -right-[6px] w-[5px] h-[5px] rounded-full border border-void ${
                agent.state === 'working' ? 'animate-pulse' : ''
              }`}
              style={{ 
                background: agent.state === 'working' ? '#22c55e' : agent.state === 'thinking' ? '#f59e0b' : color,
                boxShadow: `0 0 6px ${color}80`
              }} 
            />
          </motion.div>
        );
      })}

      {/* Label */}
      <div className="absolute top-2 left-2 z-30">
        <span className="text-[8px] uppercase tracking-[0.15em] text-white/50 font-mono px-2 py-0.5 rounded border border-white/10 bg-black/50 backdrop-blur-sm">
          NEXUS TAMAGOTCHI OFFICE
        </span>
      </div>
    </div>
  );
}
