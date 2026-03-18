import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Terminal, Play, Square,
  CheckCircle2, AlertCircle, RefreshCw, Eye, Brain, Bug, Layers 
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';

type AgentRole = 'planner' | 'generator' | 'healer';
type StepStatus = 'pending' | 'active' | 'success' | 'failed' | 'healing';

interface TestStep {
  id: string;
  role: AgentRole;
  action: string;
  target?: string;
  status: StepStatus;
  logs: string[];
}

const DEMO_STEPS: TestStep[] = [
  {
    id: 's1',
    role: 'planner',
    action: 'Vision Scan',
    target: 'Login Screen',
    status: 'success',
    logs: ['Captured viewport 1920x1080', 'Detected 2 inputs, 1 button', 'Drafted execution plan']
  },
  {
    id: 's2',
    role: 'generator',
    action: 'Type Text',
    target: 'Email Input (320, 240)',
    status: 'success',
    logs: ['Moved mouse to (320, 240)', 'Clicked left mouse btn', 'Typed "test@nexus.app"']
  },
  {
    id: 's3',
    role: 'generator',
    action: 'Type Text',
    target: 'Password Input (320, 310)',
    status: 'success',
    logs: ['Moved mouse to (320, 310)', 'Clicked left mouse btn', 'Typed "••••••••"']
  },
  {
    id: 's4',
    role: 'generator',
    action: 'Click',
    target: 'Login Button (px changed)',
    status: 'failed',
    logs: ['Moved mouse to (400, 500)', 'Clicked left mouse btn', 'ERROR: Navigation timeout. Button missed.']
  },
  {
    id: 's5',
    role: 'healer',
    action: 'Self-Healing',
    target: 'Login Button',
    status: 'healing',
    logs: ['Recapturing screen state...', 'Scanning for "Login" or "Sign In" text...', 'Found new coordinates at (420, 550)']
  }
];

export default function TesterConsolePage() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [steps] = useState<TestStep[]>(DEMO_STEPS);
  const [selectedStep, setSelectedStep] = useState<string | null>('s5');

  const RoleIcon = ({ role, className }: { role: AgentRole, className?: string }) => {
    switch (role) {
      case 'planner': return <Brain className={className} />;
      case 'generator': return <Terminal className={className} />;
      case 'healer': return <Bug className={className} />;
    }
  };

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'success': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'failed': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'active': return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
      case 'healing': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      default: return 'text-text-muted border-glass-border bg-glass';
    }
  };

  const activeTest = steps.find(s => s.id === selectedStep) || steps[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h1 className="text-sm font-semibold">Tester Agent Console</h1>
            <p className="text-[10px] text-text-muted mt-0.5">Tri-Agent UI Verification Suite</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 mr-4 border-r border-glass-border pr-5 hidden sm:flex">
            <StatusBadge status="acting" showLabel />
            <StatusBadge status="acting" showLabel />
            <StatusBadge status="idle" showLabel />
          </div>

          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isRunning 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
            }`}
          >
            {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Stop Test' : 'Run Suite'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-12">
        
        {/* Left Col: Step Sequence */}
        <div className="col-span-12 lg:col-span-4 border-r border-glass-border bg-glass/20 flex flex-col">
          <div className="p-4 border-b border-glass-border flex justify-between items-center bg-void/50">
            <h2 className="text-sm font-medium">Execution Plan</h2>
            <button className="text-xs text-text-muted hover:text-white flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {steps.map((step, idx) => (
              <motion.button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden ${
                  selectedStep === step.id 
                    ? 'border-indigo-500/50 bg-indigo-500/10' 
                    : getStatusColor(step.status)
                } ${selectedStep !== step.id && step.status === 'pending' ? 'opacity-50' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {(step.status === 'active' || step.status === 'healing') && (
                  <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500 animate-pulse" />
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <RoleIcon 
                      role={step.role} 
                      className={`w-3.5 h-3.5 ${
                        step.role === 'planner' ? 'text-indigo-400' : 
                        step.role === 'generator' ? 'text-emerald-400' : 'text-yellow-400'
                      }`} 
                    />
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">{step.role}</span>
                  </div>
                  {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {step.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  {step.status === 'healing' && <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />}
                </div>

                <div className="font-medium text-sm text-white">{step.action}</div>
                <div className="text-xs mt-1 opacity-70 truncate">{step.target}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Col: Live Inspector */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          
          {/* Virtual Screen View */}
          <div className="flex-1 p-5 flex flex-col items-center justify-center bg-void relative overflow-hidden">
            <h2 className="absolute top-5 left-5 text-sm font-medium flex items-center gap-2 z-10">
              <Eye className="w-4 h-4 text-indigo-400" />
              Vision Inspector
            </h2>
            
            <div className="w-full max-w-2xl aspect-video bg-glass/30 border border-glass-border rounded-xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
              {/* Fake UI mockup of what the vision model sees */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
              }} />
              
              <div className="text-center z-10">
                <div className="w-64 h-48 border-2 border-dashed border-glass-border/50 rounded-lg flex items-center justify-center mb-4 bg-void/50 backdrop-blur-sm">
                  <span className="text-sm text-text-muted">Waiting for feed...</span>
                </div>
                {activeTest?.status === 'healing' && (
                  <p className="text-sm text-yellow-400 animate-pulse font-mono">Healer Agent scanning for diffs...</p>
                )}
                {activeTest?.status === 'active' && (
                  <p className="text-sm text-indigo-400 animate-pulse font-mono">Generator Agent executing action...</p>
                )}
              </div>

              {/* Bounding box overlay demo */}
              {(activeTest?.id === 's1' || activeTest?.id === 's5') && (
               <motion.div 
                 className="absolute border-2 border-indigo-500 bg-indigo-500/20 z-20"
                 style={{ top: '35%', left: '42%', width: '160px', height: '44px' }}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
               >
                 <div className="absolute -top-[1.4rem] left-0 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 font-mono shadow-md">
                   score: 0.98 | login_btn
                 </div>
               </motion.div>
              )}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="h-64 bg-[#0a0a0f] border-t border-glass-border p-4 font-mono text-xs overflow-y-auto">
            <h3 className="text-text-muted mb-4 flex items-center gap-2 sticky top-0 bg-[#0a0a0f] pb-2 border-b border-glass-border/30">
              <Terminal className="w-3.5 h-3.5" /> 
              Execution Trace ({activeTest?.id})
            </h3>
            
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {activeTest?.logs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    className={`flex gap-3 leading-relaxed ${
                      log.includes('ERROR') ? 'text-red-400' : 
                      log.includes('healing') || log.includes('Recapturing') || log.includes('Found new') ? 'text-yellow-400' : 
                      'text-green-400/80'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <span className="opacity-40 shrink-0 select-none">[{new Date().toLocaleTimeString().split(' ')[0]}]</span> 
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {(activeTest?.status === 'active' || activeTest?.status === 'healing') && (
                <div className="mt-2 text-indigo-400 animate-pulse flex gap-3">
                  <span className="opacity-40 shrink-0">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                  <span>_ agent is thinking...</span>
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
