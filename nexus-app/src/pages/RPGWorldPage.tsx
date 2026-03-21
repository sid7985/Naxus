import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, MousePointerClick, Code2, Layers, 
  ChevronRight, ChevronLeft, Check, Shield, FolderOpen, Cpu,
  Crown, Palette, Megaphone, Bug, Search
} from 'lucide-react';
import AgentSprite from '../components/rpg/AgentSprite';
import GlassPanel from '../components/ui/GlassPanel';
import NeonIcon from '../components/ui/NeonIcon';
import { useRpgStore } from '../stores/rpgStore';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';
import { DEFAULT_AGENTS, APP_NAME, APP_TAGLINE, APP_SUBTITLE } from '../lib/constants';
import type { AgentRole, OllamaModel } from '../lib/types';
import '../styles/rpg.css';
import PageTransition from '../components/layout/PageTransition';

const AGENT_ICON_MAP: Record<string, any> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

const STEP_TITLES = ['Meet Your Team', 'Set Up Workspace', 'Choose Models'];

const MODULES = [
  { id: 'cloud', title: 'Cloud Engine', subtitle: 'n8n-Style Automation', icon: Cloud, color: '#06B6D4', path: '/cloud' },
  { id: 'nanoclaw', title: 'Nano Claw', subtitle: 'Desktop RPA Controller', icon: MousePointerClick, color: '#F97316', path: '/zeroclaw' },
  { id: 'ide', title: 'Agentic IDE', subtitle: 'Native Dev Env', icon: Code2, color: '#3B82F6', path: '/editor' },
  { id: 'os', title: 'NEXUS OS', subtitle: 'Command Center', icon: Layers, color: '#A855F7', path: '/command' }
];

export default function RPGWorldPage() {
  const navigate = useNavigate();
  // RPG State
  const activeQuest = useRpgStore(s => s.activeQuest);
  const agents = useAgentStore(s => s.agents);
  const isExecuting = Object.values(agents).some(a => a.status === 'acting' || a.status === 'thinking');

  // Setup State
  const { workspace, setWorkspace, setSetupComplete, setOllamaConnected, setModelAssignment } = useSettingsStore();
  const isSetupComplete = workspace?.isSetupComplete;
  
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [workspacePath, setWorkspacePath] = useState('');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean | null>(null);

  // Check Ollama on mount if not setup
  useEffect(() => {
    if (isSetupComplete) return; 
    async function checkOllama() {
      const healthy = await ollama.isHealthy();
      setOllamaHealthy(healthy);
      setOllamaConnected(healthy);
      if (healthy) {
        const modelList = await ollama.listModels();
        setModels(modelList);
      }
    }
    checkOllama();
  }, [isSetupComplete, setOllamaConnected]);

  const handleCompleteSetup = () => {
    setWorkspace({
      projectName: projectName || 'My NEXUS Project',
      workspacePath: workspacePath || '~/nexus-workspace',
      isSetupComplete: true,
    });
    setSetupComplete(true);
  };

  const canProceed = () => {
    if (step === 0 || step === 1 || step === 2) return true;
    return false;
  };

  return (
    <PageTransition>
    <div className="rpg-world h-screen w-screen overflow-hidden relative bg-[#050505]">
      
      {/* 1. BACKGROUND RPG SIMULATION LAYER (Always visible, acts as wallpaper for setup) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {DEFAULT_AGENTS.map((agent) => {
          const pos = useRpgStore.getState().agents[agent.role as AgentRole].position;
          return (
            <div 
              key={`desk-${agent.role}`}
              className="absolute w-24 h-12 border border-white/5 rounded-[50%] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="text-[8px] font-mono text-white/20 tracking-wider">
                {agent.role.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none opacity-60">
        {DEFAULT_AGENTS.map((agent) => (
          <AgentSprite key={agent.id} role={agent.role as AgentRole} />
        ))}
      </div>

      {/* 2. FOREGROUND UI LAYER */}
      
      {!isSetupComplete ? (
        /* SETUP OVERLAY */
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-start md:justify-center overflow-y-auto overflow-x-hidden bg-void/70 backdrop-blur-xl py-12 px-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
          {/* Header */}
          <motion.div className="text-center mb-12 z-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-sm font-mono tracking-[0.4em] text-text-secondary uppercase mb-1">{APP_NAME}</h1>
            <div className="w-8 h-0.5 bg-agent-manager mx-auto mb-8 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
          </motion.div>

          {/* Step indicator */}
          <motion.div className="flex items-center gap-3 mb-8 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {STEP_TITLES.map((title, i) => (
              <div key={title} className="flex items-center gap-3">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-2 transition-all duration-300 ${i === step ? 'text-white' : i < step ? 'text-agent-manager' : 'text-text-muted'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 shadow-lg ${i === step ? 'bg-agent-manager text-white shadow-agent-manager/40' : i < step ? 'bg-agent-manager/20 text-agent-manager border border-agent-manager/40' : 'bg-glass border border-glass-border text-text-muted'}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-sm hidden sm:inline">{title}</span>
                </button>
                {i < STEP_TITLES.length - 1 && <div className={`w-12 h-px transition-colors duration-300 ${i < step ? 'bg-agent-manager/40' : 'bg-glass-border'}`} />}
              </div>
            ))}
          </motion.div>

          {/* Step Content */}
          <div className="w-full max-w-3xl px-6 z-10">
            <AnimatePresence mode="wait">
              {/* Step 0: Meet Your Team */}
              {step === 0 && (
                <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                  <h2 className="text-4xl font-semibold mb-3 text-white drop-shadow-md">{APP_TAGLINE}</h2>
                  <p className="text-text-secondary text-lg mb-10">{APP_SUBTITLE}</p>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                    {DEFAULT_AGENTS.map((agent, i) => {
                      const IconComponent = AGENT_ICON_MAP[agent.icon];
                      return (
                        <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.4 }}>
                          <GlassPanel hover glowColor={agent.color} className="p-4 flex flex-col items-center gap-3 border border-white/10 bg-void/50 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40`, boxShadow: `0 0 20px -5px ${agent.color}` }}>
                              {IconComponent && <IconComponent className="w-5 h-5" style={{ color: agent.color }} />}
                            </div>
                            <span className="text-xs text-text-secondary capitalize font-medium">{agent.name}</span>
                          </GlassPanel>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="text-text-muted text-xs flex items-center justify-center gap-1.5 font-mono"><Shield className="w-3.5 h-3.5" />SECURE LOCAL INFRASTRUCTURE</p>
                </motion.div>
              )}

              {/* Step 1: Set Up Workspace */}
              {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center">
                  <h2 className="text-3xl font-semibold mb-2 text-center text-white">Set Up Your Workspace</h2>
                  <p className="text-text-secondary mb-8 text-center">Where should NEXUS keep your projects?</p>

                  <div className="w-full max-w-md space-y-4">
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block font-mono">Project Name</label>
                      <GlassPanel className="!rounded-lg border-white/10 bg-void-light/50 backdrop-blur-md">
                        <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My NEXUS Project" className="w-full bg-transparent px-4 py-3 text-white placeholder:text-text-muted outline-none text-sm" />
                      </GlassPanel>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block font-mono">Workspace Directory</label>
                      <GlassPanel className="!rounded-lg flex items-center border-white/10 bg-void-light/50 backdrop-blur-md">
                        <FolderOpen className="w-4 h-4 text-text-muted ml-4" />
                        <input type="text" value={workspacePath} onChange={(e) => setWorkspacePath(e.target.value)} placeholder="~/nexus-workspace" className="w-full bg-transparent px-3 py-3 text-white placeholder:text-text-muted outline-none text-sm" />
                      </GlassPanel>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Choose Models */}
              {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center">
                  <h2 className="text-3xl font-semibold mb-2 text-center text-white">Choose Your Models</h2>
                  <p className="text-text-secondary mb-6 text-center">Assign an Ollama model to each agent.</p>

                  <GlassPanel className="mb-6 px-4 py-3 flex items-center gap-3 w-full max-w-md border-white/10 bg-void-light/50 backdrop-blur-md">
                    <Cpu className="w-4 h-4 text-white" />
                    <span className="text-sm flex-1 font-mono text-white">Ollama Runtime</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ollamaHealthy === null ? 'bg-text-muted animate-pulse' : ollamaHealthy ? 'bg-status-done shadow-[0_0_10px_#10B981]' : 'bg-status-error'}`} />
                      <span className="text-xs text-text-secondary font-mono">{ollamaHealthy === null ? 'Checking...' : ollamaHealthy ? 'Connected' : 'Not Found'}</span>
                    </div>
                  </GlassPanel>

                  {ollamaHealthy === false && (
                    <div className="text-center mb-4">
                      <p className="text-status-error text-sm mb-1">Ollama is not running.</p>
                      <p className="text-text-muted text-xs font-mono">Run: ollama serve</p>
                    </div>
                  )}

                  <div className="w-full max-w-md space-y-2">
                    {DEFAULT_AGENTS.map((agent) => {
                      const IconComponent = AGENT_ICON_MAP[agent.icon];
                      return (
                        <GlassPanel key={agent.id} className="px-4 py-2 flex items-center gap-3 border-white/5 bg-void/40 backdrop-blur-md">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}>
                            {IconComponent && <IconComponent className="w-4 h-4" style={{ color: agent.color }} />}
                          </div>
                          <span className="text-sm flex-1 font-medium" style={{ color: agent.color }}>{agent.name}</span>
                          <select className="bg-void border border-glass-border/50 rounded-lg px-3 py-1.5 text-xs text-text-secondary outline-none font-mono appearance-none cursor-pointer hover:border-glass-border focus:border-agent-manager transition-colors" defaultValue={agent.model} onChange={(e) => setModelAssignment(agent.role, e.target.value)}>
                            {models.length > 0 ? (models.map((m) => (<option key={m.name} value={m.name}>{m.name}</option>))) : (<option value="llama3.2:latest">llama3.2:latest</option>)}
                          </select>
                        </GlassPanel>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <motion.div className="flex items-center gap-3 mt-10 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />Back
              </button>
            )}
            <button
              onClick={() => { step < 2 ? setStep(step + 1) : handleCompleteSetup(); }}
              disabled={!canProceed()}
              className="px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] text-white"
              style={{ background: 'var(--gradient-agent-manager)', boxShadow: '0 0 30px -5px rgba(124, 58, 237, 0.4)' }}
            >
              {step < 2 ? (<>Continue<ChevronRight className="w-4 h-4" /></>) : (<>Enter Hub<ChevronRight className="w-4 h-4" /></>)}
            </button>
          </motion.div>
        </div>
      ) : (
        /* MAIN HUB HUD (Replaces LaunchSelectionPage) */
        <div className="absolute inset-0 z-50 flex flex-col justify-between pointer-events-none p-6">
          
          {/* TOP BAR */}
          <div className="flex justify-between items-start w-full">
            <h1 className="text-xs font-mono tracking-[0.4em] text-white/50 uppercase flex items-center gap-2 drop-shadow-md bg-void/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-agent-manager animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
              NEXUS SIMULATION HQ
            </h1>
            
            {activeQuest && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rpg-panel pointer-events-auto p-4 min-w-[300px] backdrop-blur-md bg-void/80 border border-white/10 shadow-2xl">
                <h3 className="text-yellow-400 font-bold mb-1 text-sm flex items-center gap-2 drop-shadow-md">
                  <span className="text-lg">📜</span> [QUEST] {activeQuest.id}
                </h3>
                <p className="text-white text-xs mb-3">{activeQuest.description}</p>
                <div className="space-y-2">
                  {activeQuest.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-3 h-3 rounded-full border border-glass-border flex items-center justify-center ${task.status === 'completed' ? 'bg-status-done border-status-done text-void' : task.status === 'active' ? 'border-status-inProgress text-status-inProgress animate-pulse' : 'bg-void'}`}>
                        {task.status === 'completed' && '✓'}
                      </span>
                      <span className="text-text-muted font-mono w-20">[{task.agentId.toUpperCase()}]</span>
                      <span className={task.status === 'completed' ? 'text-text-muted line-through' : 'text-text-secondary'}>{task.description}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* CENTER CARDS (Module Navigation) */}
          <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
            <h2 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">Select Your Module</h2>
            <p className="text-text-secondary mb-10 tracking-wide text-sm font-light">Deploy an agent suite to begin operations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl px-4">
              {MODULES.map((mod) => (
                <GlassPanel 
                  key={mod.id} hover elevated glowColor={mod.color}
                  className="p-6 cursor-pointer group flex flex-col items-start transition-all duration-300 hover:scale-[1.03] bg-void/60 backdrop-blur-xl border border-white/5 relative overflow-hidden"
                  onClick={() => navigate(mod.path)}
                >
                  {/* Subtle color glow effect in background of card */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at right bottom, ${mod.color}, transparent 60%)` }} />
                  
                  <NeonIcon icon={mod.icon} color={mod.color} size="lg" className="mb-8" />
                  
                  <h3 className="text-lg font-medium text-white mb-1 drop-shadow-md">{mod.title}</h3>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-mono mb-2">{mod.subtitle}</p>
                  
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 absolute top-6 right-6 border border-white/10 group-hover:border-white/30">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex justify-between items-end w-full pointer-events-none">
            
            {/* Legend / Status */}
            <div className="rpg-panel px-4 py-2 flex items-center gap-3 pointer-events-auto bg-void/60 backdrop-blur-md border border-white/5 shadow-2xl rounded-full">
              <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-status-inProgress shadow-[0_0_8px_#3B82F6] animate-pulse' : 'bg-status-done shadow-[0_0_8px_#10B981]'}`} />
              <span className="text-xs font-mono text-text-secondary pr-4 border-r border-white/10">
                {isExecuting ? 'SIMULATION ACTIVE' : 'SYSTEM IDLE'}
              </span>
              <span className="text-xs font-mono text-text-muted pl-1 uppercase tracking-wider">
                {APP_NAME} v0.1.0-alpha
              </span>
            </div>
            
            {/* Quick action buttons (placeholder for future use) */}
            <div className="flex gap-2">
              <button onClick={() => navigate('/settings')} className="pointer-events-auto p-3 rounded-full bg-void/60 backdrop-blur-md border border-white/5 hover:bg-white/5 transition-colors text-text-muted hover:text-white group relative">
                <Crown className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-void border border-glass-border px-2 py-1 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap hidden sm:block pointer-events-none">Manager Console</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
    </PageTransition>
  );
}
