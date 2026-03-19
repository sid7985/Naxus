import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, MousePointerClick, Code2, Layers, ChevronRight } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { APP_NAME } from '../lib/constants';

const PRODUCTS = [
  {
    id: 'cloud',
    title: 'Cloud Engine',
    subtitle: 'Headless Automations',
    description: 'Connect to the server-side automation suite. Deploy headless agents via natural language.',
    icon: Cloud,
    color: '#06B6D4', // Cyan
    path: '/command', // Placeholder for future cloud route, defaulting to command center for now
  },
  {
    id: 'nanoclaw',
    title: 'Nano Claw',
    subtitle: 'Lightweight RPA',
    description: 'A stripped-down desktop mode for localized screen interaction and GUI control.',
    icon: MousePointerClick,
    color: '#F97316', // Orange
    path: '/zeroclaw', // Boot straight to the zero claw controller
  },
  {
    id: 'ide',
    title: 'Agentic IDE',
    subtitle: 'Native Developer Environment',
    description: 'Boot directly into the VS Code clone. Write code natively alongside the NEXUS Coder.',
    icon: Code2,
    color: '#3B82F6', // Blue
    path: '/editor',
  },
  {
    id: 'os',
    title: 'NEXUS OS',
    subtitle: 'All-in-One Workspace',
    description: 'The traditional Command Center. Full access to memory, models, and multi-agent orchestration.',
    icon: Layers,
    color: '#A855F7', // Purple
    path: '/command',
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function LaunchSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden nebula-bg p-8">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
        animate={{ x: [-50, 50, -50], y: [-50, 50, -50], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Header */}
      <motion.div
        className="text-center mb-16 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1 className="text-sm font-mono tracking-[0.4em] text-text-secondary uppercase mb-2">
          Welcome to {APP_NAME}
        </h1>
        <h2 className="text-4xl font-semibold text-white mb-4">Select Your Module</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
      </motion.div>

      {/* Product Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          return (
            <motion.div key={product.id} variants={itemVariants}>
              <GlassPanel 
                hover 
                glowColor={product.color}
                className="h-full p-6 cursor-pointer group flex flex-col items-start transition-all duration-300 hover:scale-[1.02]"
                onClick={() => navigate(product.path)}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${product.color}20, ${product.color}40)`, border: `1px solid ${product.color}50` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: product.color }} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text transition-colors" style={{ backgroundImage: `linear-gradient(to right, #fff, ${product.color})` }}>
                  {product.title}
                </h3>
                <h4 className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider">
                  {product.subtitle}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">
                  {product.description}
                </p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
