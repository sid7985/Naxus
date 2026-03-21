import { useState, useRef, useEffect } from 'react';
import { useNavigate }
from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Plus, Activity, Sparkles, Brain, Edit3, Bug, Plug, Network, Settings, Globe, Search, Mic, Code2, Palette, Megaphone, FolderOpen, BarChart3, ArrowLeft, PanelLeftClose, PanelRightClose, Send, Zap, Expand, Shrink
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import NeonIcon from '../components/ui/NeonIcon';
import StatusBadge from '../components/ui/StatusBadge';
import Magnetic from '../components/ui/Magnetic';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useMemoryStore } from '../stores/memoryStore';
import { ollama } from '../services/ollama';
import { orchestrator } from '../services/orchestrator';
import { APP_NAME } from '../lib/constants';
import { formatTimestamp } from '../lib/utils';
import { NexusAgentOS } from '../components/pixel-office/components/NexusAgentOS';
import NotepadWidget from '../components/os/NotepadWidget';
import PageTransition from '../components/layout/PageTransition';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

const CONTEXT_TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  files: FolderOpen,
  memory: Brain,
  web: Globe,
  metrics: BarChart3,
};

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const { memories } = useMemoryStore();
  const [input, setInput] = useState('');
  const [activeContextTab, setActiveContextTab] = useState<string>('files');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isOfficeFocus, setIsOfficeFocus] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const agents = useAgentStore((s) => s.agents);
  const missionFeed = useAgentStore((s) => s.missionFeed);
  const addMissionFeedMessage = useAgentStore((s) => s.addMissionFeedMessage);
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);
  const workspace = useSettingsStore((s) => s.workspace);
  const internetMode = useSettingsStore((s) => s.internetMode);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [missionFeed]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput('');

    addMissionFeedMessage({
      role: 'user',
      content: userMessage,
    });

    const isMission = userMessage.startsWith('/mission ') || userMessage.startsWith('/m ');

    if (isMission) {
      setIsStreaming(true);
      const missionPrompt = userMessage.replace(/^\/m(ission)?\s+/, '');
      await orchestrator.executeMission(missionPrompt);
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    updateAgentStatus('agent-manager', 'thinking');

    try {
      const model = workspace.modelAssignments.manager;
      let responseText = '';

      addMissionFeedMessage({
        role: 'assistant',
        content: '▋',
        agentId: 'agent-manager',
        agentRole: 'manager',
        isStreaming: true,
      });

      const messages = missionFeed
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
        .concat([{ role: 'user', content: userMessage }]);

      for await (const token of ollama.chat(
        model,
        messages,
        `You are NEXUS Manager, the Founder's Right Hand. You are calm, decisive, and structured. You communicate like a senior engineering lead. You help the user plan, delegate, and manage their projects. Keep responses concise and actionable.`
      )) {
        if (typeof token !== 'string') continue;
        responseText += token;
        useAgentStore.setState((state) => {
          const feed = [...state.missionFeed];
          feed[feed.length - 1] = { ...feed[feed.length - 1], content: responseText };
          return { missionFeed: feed };
        });
      }

      useAgentStore.setState((state) => {
        const feed = [...state.missionFeed];
        feed[feed.length - 1] = { ...feed[feed.length - 1], content: responseText, isStreaming: false };
        return { missionFeed: feed };
      });
    } catch (error) {
      addMissionFeedMessage({
        role: 'assistant',
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to reach Ollama. Run `ollama serve` first.'}`,
        agentId: 'agent-manager',
        agentRole: 'manager',
      });
    } finally {
      setIsStreaming(false);
      updateAgentStatus('agent-manager', 'idle');
    }
  };

  const handleEmergencyStop = () => {
    orchestrator.abort();
    setIsStreaming(false);
  };

  return (
    <PageTransition>
    <div className="h-full w-full flex flex-col bg-void">
      <AnimatePresence>
        {showNotepad && <NotepadWidget onClose={() => setShowNotepad(false)} />}
      </AnimatePresence>

      {/* ═══ IDE TITLE BAR ═══ */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-glass-border bg-void shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-1 rounded hover:bg-glass transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <div className="w-2 h-2 rounded-full bg-agent-manager" />
          <span className="text-xs font-mono tracking-wider text-text-secondary">
            {APP_NAME} <span className="text-text-muted">OS</span>
          </span>
          <span className="text-[9px] font-mono text-agent-manager/60 bg-agent-manager/10 px-1.5 py-0.5 rounded border border-agent-manager/20 ml-1">
            IDE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-text-muted mr-2">
            {internetMode === 'offline' ? '🔴 OFFLINE' : '🟢 ONLINE'}
          </span>
          <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="p-1 rounded hover:bg-glass transition-colors" title="Toggle Explorer">
            <PanelLeftClose className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button onClick={() => setShowRightPanel(!showRightPanel)} className="p-1 rounded hover:bg-glass transition-colors" title="Toggle Context">
            <PanelRightClose className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button onClick={() => navigate('/editor')} className="p-1 rounded hover:bg-glass transition-colors" title="Code Editor">
            <Code2 className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          <button onClick={() => navigate('/observability')} className="p-1 rounded hover:bg-glass transition-colors" title="Observability">
            <Activity className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          <button onClick={() => navigate('/settings')} className="p-1 rounded hover:bg-glass transition-colors" title="Settings">
            <Settings className="w-3.5 h-3.5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* ═══ IDE BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT: Explorer Panel ─── */}
        {showLeftPanel && (
          <div className="w-56 border-r border-glass-border flex flex-col overflow-hidden shrink-0 bg-void">
            {/* Agent Team */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="text-[9px] uppercase tracking-widest text-text-muted font-mono mb-2 px-1 flex items-center justify-between">
                <span>Explorer — Agents</span>
              </div>
              {agents.map((agent, idx) => {
                const IconComponent = ICON_MAP[agent.icon];
                return (
                  <motion.button
                    key={agent.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/agent/${agent.id}`)}
                    className="w-full"
                  >
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-white/[0.04] transition-colors border border-transparent hover:border-glass-border">
                      <div className={agent.status === 'idle' ? 'animate-pulse-agent' : agent.status === 'thinking' ? 'animate-thought-pulse' : ''}>
                        <NeonIcon icon={IconComponent || Crown} color={agent.color} size="sm" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-[11px] font-medium truncate" style={{ color: agent.color }}>
                          {agent.name}
                        </div>
                        <StatusBadge status={agent.status} showLabel />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-glass-border p-2 space-y-0.5 shrink-0">
              <button onClick={() => navigate('/mission/new')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-agent-manager hover:bg-glass transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Mission
              </button>
              <button onClick={() => navigate('/computer')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-agent-coder hover:bg-glass transition-colors">
                <Sparkles className="w-3 h-3" /> Computer Mode
              </button>
              <button onClick={() => navigate('/memory')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-agent-researcher hover:bg-glass transition-colors">
                <Brain className="w-3 h-3" /> Memory Systems
              </button>
              <button onClick={() => navigate('/document-intelligence')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-purple-400 hover:bg-glass transition-colors">
                <Network className="w-3 h-3" /> Document Intelligence
              </button>
              <button onClick={() => navigate('/memory-graph')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-agent-tester hover:bg-glass transition-colors">
                <Activity className="w-3 h-3" /> Interactive Graph
              </button>
              <button onClick={() => navigate('/integrations')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-agent-marketer hover:bg-glass transition-colors">
                <Plug className="w-3 h-3" /> Integrations
              </button>
              <button onClick={() => setShowNotepad(!showNotepad)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-yellow-400 hover:bg-glass transition-colors">
                <Edit3 className="w-3 h-3" /> Notepad
              </button>
              <button onClick={() => navigate('/voice')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-indigo-400 hover:bg-glass transition-colors">
                <Mic className="w-3 h-3" /> Voice Control
              </button>
            </div>
          </div>
        )}

        {/* ─── CENTER: Editor Area ─── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Office Simulator (Top Pane / Focused Pane) */}
          <motion.div 
            layout
            initial={false}
            animate={{ 
              height: isOfficeFocus ? '65%' : '12rem', /* 12rem is roughly h-48 */
              minHeight: isOfficeFocus ? '400px' : 'auto'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-b border-glass-border shrink-0 hidden md:block relative z-10"
          >
            <NexusAgentOS isFocused={isOfficeFocus} />
          </motion.div>

          {/* Session Tab Bar */}
          <div className="px-3 py-1.5 border-b border-glass-border flex items-center justify-between shrink-0 bg-void z-20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-agent-manager px-2 py-0.5 rounded bg-agent-manager/10 border border-agent-manager/20">
                TERMINAL
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {workspace.projectName || 'NEXUS Workspace'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-text-muted hidden sm:inline">
                {isStreaming ? '⚡ AGENTS ACTIVE' : '◉ STANDING BY'}
              </span>
              <button 
                onClick={() => setIsOfficeFocus(!isOfficeFocus)}
                className="p-1 rounded hover:bg-glass transition-colors"
                title={isOfficeFocus ? "Minimize Office View" : "Maximize Office View"}
              >
                {isOfficeFocus ? <Shrink className="w-3.5 h-3.5 text-agent-manager" /> : <Expand className="w-3.5 h-3.5 text-text-muted hover:text-white" />}
              </button>
            </div>
          </div>

          {/* Mission Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {missionFeed.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-7 h-7 text-agent-manager/30 mb-3" />
                <p className="text-text-secondary text-sm">NEXUS Command Center</p>
                <p className="text-text-muted text-xs mt-1">Type a command or launch a new mission.</p>
              </div>
            )}

            {missionFeed.map((msg) => {
              const agent = msg.agentRole
                ? agents.find((a) => a.role === msg.agentRole)
                : null;
              const AgentIcon = agent ? ICON_MAP[agent.icon] : null;

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && agent && (
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-1"
                      style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}20` }}
                    >
                      {AgentIcon && <AgentIcon className="w-3 h-3" style={{ color: agent.color }} />}
                    </div>
                  )}

                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role !== 'user' && agent && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold" style={{ color: agent.color }}>
                          [{agent.name.toUpperCase()}]
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    <div className={`px-3 py-2 rounded-lg border backdrop-blur-sm ${
                      msg.role === 'user'
                        ? 'bg-agent-manager/10 border-agent-manager/20'
                        : 'bg-white/[0.03] border-glass-border'
                    }`}>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                        {msg.isStreaming && <span className="animate-pulse ml-0.5">▋</span>}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="mt-0.5 text-[9px] font-mono text-text-muted">
                        {formatTimestamp(msg.timestamp)} [USER]
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <div ref={feedEndRef} />
          </div>

          {/* Command Input */}
          <div className="px-3 py-2 border-t border-glass-border shrink-0 bg-void">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-glass-border rounded-lg px-3 py-0.5">
              <span className="text-agent-manager text-xs font-mono shrink-0">❯</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isStreaming ? 'Agents working...' : 'Message agents... (prefix /mission for multi-agent)'}
                className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-text-muted outline-none font-mono"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={handleEmergencyStop}
                  className="px-2.5 py-1 rounded bg-status-error/10 text-status-error hover:bg-status-error/20 transition-colors text-[10px] font-mono"
                >
                  STOP
                </button>
              ) : (
                <Magnetic disabled={!input.trim()}>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-1.5 rounded text-agent-manager hover:bg-agent-manager/10 transition-colors disabled:opacity-30"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </Magnetic>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Context Panel ─── */}
        {showRightPanel && (
          <div className="w-64 border-l border-glass-border flex flex-col overflow-hidden shrink-0 bg-void">
            {/* Tabs */}
            <div className="flex border-b border-glass-border shrink-0">
              {(['files', 'memory', 'web', 'metrics'] as const).map((tab) => {
                const TabIcon = CONTEXT_TAB_ICONS[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveContextTab(tab)}
                    className={`flex-1 py-2 flex items-center justify-center gap-1 text-[10px] transition-colors ${
                      activeContextTab === tab
                        ? 'text-white border-b-2 border-agent-manager'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {TabIcon && <TabIcon className="w-3 h-3" />}
                    <span className="capitalize hidden xl:inline">{tab}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-2.5">
              {activeContextTab === 'metrics' && (
                <div className="space-y-2">
                  <div className="text-[9px] uppercase tracking-widest text-text-muted font-mono">
                    System Telemetry
                  </div>
                  <GlassPanel className="p-2.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-text-secondary">Neural Load</span>
                      <span className="text-[10px] font-mono text-agent-coder">42.8%</span>
                    </div>
                    <div className="h-1 bg-void rounded-full overflow-hidden">
                      <div className="h-full bg-agent-coder rounded-full" style={{ width: '42.8%' }} />
                    </div>
                  </GlassPanel>
                  <GlassPanel className="p-2.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-text-secondary">Memory</span>
                      <span className="text-[10px] font-mono text-agent-marketer">18.2 GB</span>
                    </div>
                    <div className="h-1 bg-void rounded-full overflow-hidden">
                      <div className="h-full bg-agent-marketer rounded-full" style={{ width: '57%' }} />
                    </div>
                  </GlassPanel>
                  <GlassPanel className="p-2.5">
                    <div className="text-[11px] text-text-secondary mb-1">Active Agents</div>
                    <div className="text-xl font-mono text-white">
                      {agents.filter((a) => a.status !== 'idle').length}
                      <span className="text-text-muted text-sm"> / {agents.length}</span>
                    </div>
                  </GlassPanel>
                </div>
              )}

              {activeContextTab === 'files' && (
                <div className="space-y-2">
                  <div className="text-[9px] uppercase tracking-widest text-text-muted font-mono mb-1">
                    Workspace
                  </div>
                  <div className="text-[11px] text-text-muted font-mono">
                    {workspace.workspacePath || '~/nexus-workspace'}
                  </div>
                  <div className="mt-2 text-[11px] text-text-muted">
                    File explorer will appear once connected to workspace.
                  </div>
                </div>
              )}

              {activeContextTab === 'memory' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="text-[9px] uppercase tracking-widest text-text-muted font-mono">
                      Context Memory
                    </div>
                    <span className="text-[9px] bg-agent-manager/10 text-agent-manager px-1 py-0.5 rounded font-mono">
                      {memories.length}
                    </span>
                  </div>
                  
                  {memories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-28 text-center bg-white/[0.02] border border-glass-border border-dashed rounded-lg">
                      <Brain className="w-4 h-4 text-text-muted/40 mb-1.5" />
                      <span className="text-[10px] text-text-muted">No memories yet</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {memories.slice(0, 8).map(mem => (
                        <GlassPanel key={mem.id} className="p-2">
                          <div className="flex items-start gap-1.5">
                            <div className={`w-0.5 self-stretch rounded-full shrink-0 ${
                              mem.layer === 'core' ? 'bg-agent-manager' : 
                              mem.layer === 'project' ? 'bg-agent-coder' : 
                              'bg-agent-marketer'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                                {mem.content}
                              </p>
                              <span className="text-[8px] font-mono text-text-muted uppercase mt-1 inline-block">
                                {mem.layer}
                              </span>
                            </div>
                          </div>
                        </GlassPanel>
                      ))}
                      {memories.length > 8 && (
                        <button 
                          onClick={() => navigate('/memory')}
                          className="w-full py-1.5 text-[10px] font-mono hover:text-white transition-colors text-text-muted text-center"
                        >
                          View all {memories.length} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeContextTab === 'web' && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <span className="text-[11px] text-text-muted font-mono">
                    Web access in Beta
                  </span>
                </div>
              )}
            </div>

            {/* User Badge */}
            <div className="p-2 border-t border-glass-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-agent-marketer/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-agent-marketer" />
                </div>
                <div>
                  <div className="text-[10px] font-medium">ROOT_USER</div>
                  <div className="text-[9px] text-text-muted">Secure</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ IDE STATUS BAR ═══ */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-glass-border bg-agent-manager/5 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-agent-manager">
            SECURE UPLINK
          </span>
          <span className="text-[9px] font-mono text-text-muted">
            {APP_NAME} v0.1.0-α
          </span>
        </div>
        <div className="flex items-center gap-3">
          {agents.slice(0, 4).map(agent => (
            <div key={agent.id} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ 
                background: agent.status === 'idle' ? agent.color : '#22c55e',
                boxShadow: agent.status !== 'idle' ? '0 0 4px #22c55e' : 'none'
              }} />
              <span className="text-[8px] font-mono text-text-muted uppercase">{agent.role.slice(0,3)}</span>
            </div>
          ))}
          <span className="text-[9px] font-mono text-text-muted">
            {isStreaming ? '⚡ ACTIVE' : '◉ IDLE'}
          </span>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
