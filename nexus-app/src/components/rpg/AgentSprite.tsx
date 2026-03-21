import { motion } from 'framer-motion';
import { useRpgStore } from '../../stores/rpgStore';
import { AGENT_COLORS } from '../../lib/constants';
import type { AgentRole } from '../../lib/types';

interface AgentSpriteProps {
  role: AgentRole;
}

export default function AgentSprite({ role }: AgentSpriteProps) {
  const agentData = useRpgStore((state) => state.agents[role]);
  
  if (!agentData) return null;

  const { state, position, speechBubbles } = agentData;
  const color = AGENT_COLORS[role];

  return (
    <motion.div
      className={`rpg-agent rpg-state-${state}`}
      initial={false}
      // Animate position changes smoothly
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: Math.round(position.y), // Y-sorting (lower on screen = higher z-index)
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 10,
        mass: 1
      }}
    >
      {/* Role-colored ground glow */}
      <div 
        className="rpg-glow-ring" 
        style={{ '--glow-color': color } as React.CSSProperties}
      />
      
      {/* Base Drop Shadow */}
      <div className="rpg-shadow" />

      {/* The Sprite Image (Animated via CSS Background) */}
      <div
        className="rpg-sprite"
        style={{ 
          '--glow-color': color,
          filter: role !== 'manager' ? `hue-rotate(${getHueOffset(role)}deg) drop-shadow(0 4px 4px rgba(0,0,0,0.5))` : undefined
        } as React.CSSProperties}
      />

      {/* Active Speech Bubbles */}
      {speechBubbles.map((bubble, i) => (
        <div 
          key={bubble.id} 
          className="rpg-speech-bubble"
          style={{ bottom: `${110 + (i * 40)}px` }} // Stack them if multiple
        >
          {bubble.text}
        </div>
      ))}
    </motion.div>
  );
}

// Temporary helper to tint the manager sprite for other roles until we get unique sprites
function getHueOffset(role: AgentRole): number {
  switch (role) {
    case 'coder': return 200; // Blue tint
    case 'designer': return -50;  // Pink tint
    case 'tester': return 50;   // Green/Yellow tint
    case 'researcher': return 280; // Purple tint
    case 'marketer': return 100; // Green tint
    default: return 0;
  }
}
