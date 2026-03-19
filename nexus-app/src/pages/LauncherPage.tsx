import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Code2, Palette, Megaphone, Bug, Search,
  ChevronRight, ChevronLeft, Check, Shield,
  FolderOpen, Cpu
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';
import type { OllamaModel } from '../lib/types';
import { DEFAULT_AGENTS, APP_NAME, APP_TAGLINE, APP_SUBTITLE } from '../lib/constants';
import PageTransition from '../components/layout/PageTransition';

const AGENT_ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

const STEP_TITLES = [
  'Meet Your Team',
  'Set Up Workspace',
  'Choose Models',
];

export default function LauncherPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [workspacePath, setWorkspacePath] = useState('');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean | null>(null);
  const { setWorkspace, setSetupComplete, setOllamaConnected, setModelAssignment } = useSettingsStore();

  // Check Ollama on mount
  useEffect(() => {
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
  }, []);

  const handleComplete = () => {
    setWorkspace({
      projectName: projectName || 'My NEXUS Project',
      workspacePath: workspacePath || '~/nexus-workspace',
      isSetupComplete: true,
    });
    setSetupComplete(true);
    navigate('/');
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return true; // Allow empty → use defaults
    if (step === 2) return true;
    return false;
  };

  return (
    <PageTransition>
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-start md:justify-center overflow-y-auto overflow-x-hidden nebula-bg py-12 px-4">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02] translate-x-60"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
        animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Header */}
      <motion.div
        className="text-center mb-12 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1 className="text-sm font-mono tracking-[0.4em] text-text-secondary uppercase mb-1">
          {APP_NAME}
        </h1>
        <div className="w-8 h-0.5 bg-agent-manager mx-auto mb-8 rounded-full" />
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="flex items-center gap-3 mb-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {STEP_TITLES.map((title, i) => (
          <div key={title} className="flex items-center gap-3">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 transition-all duration-300 ${
                i === step
                  ? 'text-white'
                  : i < step
                  ? 'text-agent-manager'
                  : 'text-text-muted'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                  i === step
                    ? 'bg-agent-manager text-white'
                    : i < step
                    ? 'bg-agent-manager/20 text-agent-manager border border-agent-manager/40'
                    : 'bg-glass border border-glass-border text-text-muted'
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-sm hidden sm:inline">{title}</span>
            </button>
            {i < STEP_TITLES.length - 1 && (
              <div className={`w-12 h-px transition-colors duration-300 ${
                i < step ? 'bg-agent-manager/40' : 'bg-glass-border'
              }`} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <div className="w-full max-w-3xl px-6 z-10">
        <AnimatePresence mode="wait">
          {/* Step 0: Meet Your Team */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center"
            >
              <h2 className="text-4xl font-semibold mb-3">{APP_TAGLINE}</h2>
              <p className="text-text-secondary text-lg mb-10">{APP_SUBTITLE}</p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                {DEFAULT_AGENTS.map((agent, i) => {
                  const IconComponent = AGENT_ICON_MAP[agent.icon];
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <GlassPanel
                        hover
                        glowColor={agent.color}
                        className="p-4 flex flex-col items-center gap-3"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5" style={{ color: agent.color }} />}
                        </div>
                        <span className="text-xs text-text-secondary capitalize">{agent.name}</span>
                      </GlassPanel>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-text-muted text-xs flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                END-TO-END ENCRYPTED INFRASTRUCTURE
              </p>
            </motion.div>
          )}

          {/* Step 1: Set Up Workspace */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-3xl font-semibold mb-2 text-center">Set Up Your Workspace</h2>
              <p className="text-text-secondary mb-8 text-center">Where should NEXUS keep your projects?</p>

              <div className="w-full max-w-md space-y-4">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block font-mono">
                    Project Name
                  </label>
                  <GlassPanel className="!rounded-lg">
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="My NEXUS Project"
                      className="w-full bg-transparent px-4 py-3 text-white placeholder:text-text-muted outline-none text-sm"
                    />
                  </GlassPanel>
                </div>

                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block font-mono">
                    Workspace Directory
                  </label>
                  <GlassPanel className="!rounded-lg flex items-center">
                    <FolderOpen className="w-4 h-4 text-text-muted ml-4" />
                    <input
                      type="text"
                      value={workspacePath}
                      onChange={(e) => setWorkspacePath(e.target.value)}
                      placeholder="~/nexus-workspace"
                      className="w-full bg-transparent px-3 py-3 text-white placeholder:text-text-muted outline-none text-sm"
                    />
                  </GlassPanel>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Choose Models */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-3xl font-semibold mb-2 text-center">Choose Your Models</h2>
              <p className="text-text-secondary mb-6 text-center">
                Assign an Ollama model to each agent.
              </p>

              {/* Ollama status */}
              <GlassPanel className="mb-6 px-4 py-3 flex items-center gap-3 w-full max-w-md">
                <Cpu className="w-4 h-4" />
                <span className="text-sm flex-1 font-mono">Ollama Runtime</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    ollamaHealthy === null ? 'bg-text-muted animate-pulse'
                    : ollamaHealthy ? 'bg-status-done'
                    : 'bg-status-error'
                  }`} />
                  <span className="text-xs text-text-secondary font-mono">
                    {ollamaHealthy === null ? 'Checking...' : ollamaHealthy ? 'Connected' : 'Not Found'}
                  </span>
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
                    <GlassPanel key={agent.id} className="px-4 py-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${agent.color}20` }}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" style={{ color: agent.color }} />}
                      </div>
                      <span className="text-sm flex-1" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      <select
                        className="bg-void-light border border-glass-border rounded-lg px-3 py-1.5 text-xs text-text-secondary outline-none font-mono appearance-none cursor-pointer"
                        defaultValue={agent.model}
                        onChange={(e) => setModelAssignment(agent.role, e.target.value)}
                      >
                        {models.length > 0 ? (
                          models.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))
                        ) : (
                          <option value="llama3.2:latest">llama3.2:latest</option>
                        )}
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
      <motion.div
        className="flex items-center gap-3 mt-10 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <button
          onClick={() => {
            if (step < 2) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed()}
          className="px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            boxShadow: '0 0 30px -5px rgba(124, 58, 237, 0.4)',
          }}
        >
          {step < 2 ? (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Get Started
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
    </PageTransition>
  );
}
