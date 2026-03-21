import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Cloud, Play, Timer,
  ChevronRight, Workflow
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageTransition from '../components/layout/PageTransition';

// ── Workflow Node Types ──
type NodeType = 'trigger' | 'action' | 'condition' | 'output';

interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  x: number;
  y: number;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: number;
  category: 'api' | 'data' | 'comms' | 'devops';
  color: string;
}

const TEMPLATES: AutomationTemplate[] = [
  { id: 'a1', name: 'Webhook → AI Analysis', description: 'Receive webhook, run through Coder agent, store results', icon: '🔗', nodes: 4, category: 'api', color: '#06B6D4' },
  { id: 'a2', name: 'GitHub PR Review', description: 'On PR open → fetch diff → AI review → post comment', icon: '🔍', nodes: 5, category: 'devops', color: '#7C3AED' },
  { id: 'a3', name: 'Daily Digest Email', description: 'Cron trigger → aggregate data → format → send email', icon: '📧', nodes: 4, category: 'comms', color: '#F59E0B' },
  { id: 'a4', name: 'Database Sync', description: 'Watch DB changes → transform → push to external API', icon: '🔄', nodes: 3, category: 'data', color: '#10B981' },
  { id: 'a5', name: 'Slack Alert Pipeline', description: 'Monitor logs → filter errors → format alert → Slack', icon: '💬', nodes: 4, category: 'comms', color: '#F43F5E' },
  { id: 'a6', name: 'CI/CD Orchestrator', description: 'On push → build → test → deploy → notify', icon: '🚀', nodes: 6, category: 'devops', color: '#3B82F6' },
];

const NODE_PALETTE = [
  { type: 'trigger' as NodeType, label: 'Webhook', icon: '🔗', color: '#06B6D4', description: 'HTTP endpoint trigger' },
  { type: 'trigger' as NodeType, label: 'Cron Schedule', icon: '⏰', color: '#F59E0B', description: 'Time-based trigger' },
  { type: 'trigger' as NodeType, label: 'File Watch', icon: '📁', color: '#10B981', description: 'File system trigger' },
  { type: 'action' as NodeType, label: 'AI Agent', icon: '🤖', color: '#7C3AED', description: 'Run an AI agent' },
  { type: 'action' as NodeType, label: 'HTTP Request', icon: '🌐', color: '#3B82F6', description: 'Make API call' },
  { type: 'action' as NodeType, label: 'Database', icon: '💾', color: '#F97316', description: 'Query/write database' },
  { type: 'action' as NodeType, label: 'Transform', icon: '🔧', color: '#14B8A6', description: 'Transform data' },
  { type: 'condition' as NodeType, label: 'If/Else', icon: '🔀', color: '#EAB308', description: 'Conditional branch' },
  { type: 'output' as NodeType, label: 'Send Email', icon: '📧', color: '#EC4899', description: 'Email notification' },
  { type: 'output' as NodeType, label: 'Slack Message', icon: '💬', color: '#F43F5E', description: 'Send to Slack' },
];

// ── Demo Canvas Nodes ──
const DEMO_NODES: WorkflowNode[] = [
  { id: 'n1', type: 'trigger', label: 'Webhook', icon: '🔗', color: '#06B6D4', description: 'POST /api/trigger', x: 80, y: 180 },
  { id: 'n2', type: 'action', label: 'AI Agent', icon: '🤖', color: '#7C3AED', description: 'Analyze payload', x: 340, y: 120 },
  { id: 'n3', type: 'condition', label: 'If/Else', icon: '🔀', color: '#EAB308', description: 'Check confidence', x: 600, y: 180 },
  { id: 'n4', type: 'output', label: 'Slack', icon: '💬', color: '#F43F5E', description: 'Alert team', x: 860, y: 100 },
  { id: 'n5', type: 'action', label: 'Database', icon: '💾', color: '#F97316', description: 'Store result', x: 860, y: 260 },
];

export default function CloudEnginePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'canvas' | 'templates'>('canvas');
  const [nodes] = useState<WorkflowNode[]>(DEMO_NODES);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const handleRunWorkflow = () => {
    setIsRunning(true);
    setExecutionLog([]);
    
    // Simulate step-by-step execution
    const steps = nodes.map((n, i) => `[${new Date().toLocaleTimeString()}] Step ${i + 1}: Executing "${n.label}" node...`);
    steps.forEach((step, i) => {
      setTimeout(() => {
        setExecutionLog(prev => [...prev, step]);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Workflow completed successfully.`]);
            setIsRunning(false);
          }, 600);
        }
      }, (i + 1) * 800);
    });
  };

  // Draw SVG connections between sequential nodes
  const renderConnections = () => {
    const lines = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i];
      const to = nodes[i + 1];
      // For the condition node, branch to two targets
      if (from.type === 'condition' && i + 2 < nodes.length) {
        lines.push(
          <line key={`conn-${i}-a`} x1={from.x + 80} y1={from.y + 25} x2={to.x} y2={to.y + 25}
            stroke={from.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />,
          <line key={`conn-${i}-b`} x1={from.x + 80} y1={from.y + 25} x2={nodes[i + 2].x} y2={nodes[i + 2].y + 25}
            stroke={from.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />
        );
        continue;
      }
      lines.push(
        <line key={`conn-${i}`} x1={from.x + 80} y1={from.y + 25} x2={to.x} y2={to.y + 25}
          stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 3" />
      );
    }
    return lines;
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col bg-void overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border bg-void/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Cloud className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-semibold">Cloud Engine</h1>
          <span className="text-[10px] font-mono text-cyan-400/60 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
            AUTOMATION STUDIO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-glass rounded-lg p-0.5 border border-glass-border">
            {(['canvas', 'templates'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono capitalize transition-colors ${
                  activeTab === tab ? 'bg-cyan-400/15 text-cyan-400' : 'text-text-muted hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={handleRunWorkflow} disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 text-white"
            style={{ background: isRunning ? '#F59E0B' : 'linear-gradient(135deg, #06B6D4, #3B82F6)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
          >
            {isRunning ? <><Timer className="w-3.5 h-3.5 animate-spin" /> Running...</> : <><Play className="w-3.5 h-3.5" /> Execute</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Node Palette (Left) ── */}
        <div className="w-56 border-r border-glass-border overflow-y-auto p-3 space-y-1 shrink-0 bg-void-light/30">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-3 px-1">
            Node Palette
          </div>
          {NODE_PALETTE.map((node, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab hover:bg-white/[0.04] transition-colors border border-transparent hover:border-glass-border group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ background: `${node.color}15`, border: `1px solid ${node.color}25` }}
              >
                {node.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-text-secondary group-hover:text-white transition-colors truncate">{node.label}</div>
                <div className="text-[10px] text-text-muted truncate">{node.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {activeTab === 'canvas' ? (
            <>
              {/* Canvas */}
              <div className="flex-1 relative overflow-auto"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 70%)' }}
              >
                {/* Grid dots background */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <pattern id="cloud-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="15" cy="15" r="1" fill="rgba(6,182,212,0.12)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cloud-grid)" />
                  {/* Connection lines */}
                  {renderConnections()}
                </svg>

                {/* Workflow Nodes */}
                {nodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                    className={`absolute cursor-pointer group ${selectedNode?.id === node.id ? 'z-10' : ''}`}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <GlassPanel 
                      hover elevated 
                      glowColor={selectedNode?.id === node.id ? node.color : undefined}
                      className={`w-[160px] p-3 transition-all duration-200 ${
                        selectedNode?.id === node.id ? '!border-white/20 shadow-lg' : 'border-white/5'
                      }`}
                    >
                      {/* Type Badge */}
                      <div className="absolute -top-2 left-3 text-[8px] font-mono uppercase tracking-widest px-1.5 py-px rounded"
                        style={{ background: `${node.color}20`, color: node.color, border: `1px solid ${node.color}30` }}
                      >
                        {node.type}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">{node.icon}</span>
                        <div>
                          <div className="text-xs font-medium text-white">{node.label}</div>
                          <div className="text-[10px] text-text-muted">{node.description}</div>
                        </div>
                      </div>
                      
                      {/* Connection dots */}
                      <div className="absolute top-1/2 -left-1.5 w-3 h-3 rounded-full border-2 -translate-y-1/2"
                        style={{ borderColor: node.color, background: `${node.color}30` }} />
                      <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full border-2 -translate-y-1/2"
                        style={{ borderColor: node.color, background: `${node.color}30` }} />
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>

              {/* Execution Log */}
              <AnimatePresence>
                {executionLog.length > 0 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 140 }} exit={{ height: 0 }}
                    className="border-t border-glass-border overflow-hidden"
                  >
                    <div className="p-3 h-full overflow-y-auto bg-void/80">
                      <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono mb-2">
                        Execution Log
                      </div>
                      {executionLog.map((log, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className={`text-xs font-mono py-0.5 ${log.includes('✅') ? 'text-green-400' : 'text-text-secondary'}`}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Templates View */
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((tmpl) => (
                  <GlassPanel key={tmpl.id} hover elevated glowColor={tmpl.color}
                    className="p-5 cursor-pointer group transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{tmpl.icon}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded capitalize"
                        style={{ background: `${tmpl.color}15`, color: tmpl.color }}
                      >
                        {tmpl.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{tmpl.name}</h3>
                    <p className="text-xs text-text-muted mb-4 leading-relaxed">{tmpl.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                        <Workflow className="w-3 h-3" /> {tmpl.nodes} nodes
                      </span>
                      <span className="text-xs text-cyan-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Use Template <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Inspector Panel (Right) ── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-glass-border overflow-hidden shrink-0 bg-void-light/30"
            >
              <div className="w-[280px] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">Node Inspector</span>
                  <button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-white text-sm">&times;</button>
                </div>

                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-2xl mb-3"
                    style={{ background: `${selectedNode.color}15`, border: `1px solid ${selectedNode.color}30`, boxShadow: `0 0 25px ${selectedNode.color}15` }}
                  >
                    {selectedNode.icon}
                  </div>
                  <div className="text-sm font-semibold text-white">{selectedNode.label}</div>
                  <div className="text-[10px] font-mono uppercase mt-1" style={{ color: selectedNode.color }}>{selectedNode.type} node</div>
                </div>

                <GlassPanel className="p-3 space-y-2">
                  <div className="text-[10px] text-text-muted uppercase font-mono">Configuration</div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Description</span><span className="text-text-secondary">{selectedNode.description}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Position</span><span className="text-text-secondary font-mono">({selectedNode.x}, {selectedNode.y})</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Status</span><span className="text-green-400 font-mono">Ready</span></div>
                </GlassPanel>

                <GlassPanel className="p-3 space-y-2">
                  <div className="text-[10px] text-text-muted uppercase font-mono">Input Schema</div>
                  <div className="bg-black/30 rounded p-2 text-[10px] font-mono text-text-secondary">
                    {`{\n  "payload": "any",\n  "headers": "object"\n}`}
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}
