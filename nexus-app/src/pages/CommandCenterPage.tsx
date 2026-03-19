import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, Code2, Palette, Megaphone, Bug, Search,
  Send, Sparkles, Globe, FolderOpen, Brain,
  BarChart3, Plus, Settings, Zap, Activity, Plug, Mic
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import StatusBadge from '../components/ui/StatusBadge';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useMemoryStore } from '../stores/memoryStore';
import { ollama } from '../services/ollama';
import { orchestrator } from '../services/orchestrator';
import { APP_NAME } from '../lib/constants';
import { formatTimestamp } from '../lib/utils';


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
  const feedEndRef = useRef<HTMLDivElement>(null);

  const agents = useAgentStore((s) => s.agents);
  const missionFeed = useAgentStore((s) => s.missionFeed);
  const addMissionFeedMessage = useAgentStore((s) => s.addMissionFeedMessage);
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);
  const workspace = useSettingsStore((s) => s.workspace);
  const internetMode = useSettingsStore((s) => s.internetMode);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [missionFeed]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput('');

    // Add user message to feed
    addMissionFeedMessage({
      role: 'user',
      content: userMessage,
    });

    // Check if this is a multi-agent mission command
    const isMission = userMessage.startsWith('/mission ') || userMessage.startsWith('/m ');

    if (isMission) {
      // Use orchestrator for full delegation flow
      setIsStreaming(true);
      const missionPrompt = userMessage.replace(/^\/m(ission)?\s+/, '');
      await orchestrator.executeMission(missionPrompt);
      setIsStreaming(false);
      return;
    }

    // Stream response from Manager agent (direct chat)
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
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to reach Ollama. Run \`ollama serve\` first.'}`,
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
    <div className="h-full w-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-agent-manager" />
          <span className="text-sm font-mono tracking-wider text-text-secondary">
            {APP_NAME} <span className="text-text-muted">OS</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted">
            {internetMode === 'offline' ? '🔴 OFFLINE' : '🟢 ONLINE'}
          </span>
          <button
            onClick={() => navigate('/editor')}
            className="p-1.5 rounded-lg hover:bg-glass transition-colors"
            title="Code Editor"
          >
            <Code2 className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => navigate('/observability')}
            className="p-1.5 rounded-lg hover:bg-glass transition-colors"
            title="Observability"
          >
            <Activity className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg hover:bg-glass transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* --- Left Sidebar: Agent Team --- */}
        <div className={`w-60 border-r border-glass-border flex flex-col p-3 gap-2 overflow-y-auto shrink-0 transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-r-white/10' : 'bg-void'}`}>
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-1 px-1">
            Active Agents
          </div>
          {agents.map((agent) => {
            const IconComponent = ICON_MAP[agent.icon];
            return (
              <motion.button
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/agent/${agent.id}`)}
                className="w-full"
              >
                <GlassPanel hover className="p-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `${agent.color}15`,
                      border: `1px solid ${agent.color}30`,
                      boxShadow: agent.status === 'thinking' ? `0 0 12px ${agent.color}40` : 'none',
                    }}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4" style={{ color: agent.color }} />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: agent.color }}>
                      {agent.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusBadge status={agent.status} showLabel />
                    </div>
                  </div>
                </GlassPanel>
              </motion.button>
            );
          })}

          {/* Quick actions */}
          <div className="mt-auto pt-3 border-t border-glass-border space-y-1">
            <button
              onClick={() => navigate('/mission/new')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-agent-manager hover:bg-glass transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Mission
            </button>
            <button
               onClick={() => navigate('/computer')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-agent-coder hover:bg-glass transition-colors"
             >
               <Sparkles className="w-3.5 h-3.5" />
               Computer Mode
             </button>
             <button
               onClick={() => navigate('/memory')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-agent-researcher hover:bg-glass transition-colors"
             >
               <Brain className="w-3.5 h-3.5" />
               Memory Systems
             </button>
             <button
               onClick={() => navigate('/memory-graph')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-agent-tester hover:bg-glass transition-colors border border-agent-tester/20 bg-agent-tester/5"
             >
               <Activity className="w-3.5 h-3.5" />
               Interactive Graph
             </button>
             <button
               onClick={() => navigate('/todo')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cyan-400 hover:bg-glass transition-colors border border-cyan-400/20 bg-cyan-400/5 mt-2"
             >
               <Sparkles className="w-3.5 h-3.5" />
               E2E App Test
             </button>
             <button
               onClick={() => navigate('/integrations')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-agent-marketer hover:bg-glass transition-colors"
             >
               <Plug className="w-3.5 h-3.5" />
               Integrations Hub
             </button>
             <button
               onClick={() => navigate('/voice')}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-indigo-400 hover:bg-glass transition-colors"
             >
               <Mic className="w-3.5 h-3.5" />
               Voice Control
             </button>
           </div>
         </div>

        {/* --- Center: Mission Feed --- */}
        <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${liquidGlassEnabled ? 'bg-void' : ''}`}>
          {/* Session header */}
          <div className="px-4 py-2 border-b border-glass-border flex items-center justify-between">
            <span className="text-xs font-mono text-agent-manager">
              # TERMINAL_SESSION <span className="text-text-muted">ENCRYPTED</span>
            </span>
            <span className="text-xs font-mono text-text-muted">
              {workspace.projectName || 'NEXUS Workspace'}
            </span>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {missionFeed.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-8 h-8 text-agent-manager/40 mb-4" />
                <p className="text-text-secondary text-sm">Welcome to NEXUS Command Center</p>
                <p className="text-text-muted text-xs mt-1">Type a command to get started, or launch a new mission.</p>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && agent && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ background: `${agent.color}20` }}
                    >
                      {AgentIcon && <AgentIcon className="w-3.5 h-3.5" style={{ color: agent.color }} />}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role !== 'user' && agent && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold" style={{ color: agent.color }}>
                          [{agent.name.toUpperCase()}]
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    <GlassPanel
                      className={`px-4 py-3 ${
                        msg.role === 'user'
                          ? '!bg-agent-manager/10 !border-agent-manager/20'
                          : ''
                      }`}
                    >
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                        {msg.isStreaming && <span className="animate-pulse ml-0.5">▋</span>}
                      </p>
                    </GlassPanel>

                    {msg.role === 'user' && (
                      <div className="mt-1 text-[10px] font-mono text-text-muted">
                        {formatTimestamp(msg.timestamp)} [USER]
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <div ref={feedEndRef} />
          </div>

          {/* Command bar */}
          <div className="px-4 py-3 border-t border-glass-border">
            <GlassPanel className="flex items-center gap-2 px-4 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isStreaming ? 'Agents working...' : 'Message agents... (prefix /mission for multi-agent)'}
                className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-text-muted outline-none"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={handleEmergencyStop}
                  className="px-3 py-1.5 rounded-lg bg-status-error/10 text-status-error hover:bg-status-error/20 transition-colors text-xs font-mono"
                >
                  STOP
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg text-agent-manager hover:bg-agent-manager/10 transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </GlassPanel>
            <div className="text-center mt-2">
              <span className="text-[10px] font-mono text-text-muted tracking-wider">
                SECURE UPLINK // NEXUS v0.1.0-α // {isStreaming ? '⚡ AGENTS ACTIVE' : '◉ STANDING BY'}
              </span>
            </div>
          </div>
        </div>

        {/* --- Right Rail: Context Panel --- */}
        <div className={`w-72 border-l border-glass-border flex flex-col shrink-0 transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-l-white/10' : 'bg-void'}`}>
          {/* Tabs */}
          <div className="flex border-b border-glass-border">
            {(['files', 'memory', 'web', 'metrics'] as const).map((tab) => {
              const TabIcon = CONTEXT_TAB_ICONS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveContextTab(tab)}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs transition-colors ${
                    activeContextTab === tab
                      ? 'text-white border-b-2 border-agent-manager'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                  <span className="capitalize hidden xl:inline">{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeContextTab === 'metrics' && (
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono">
                  System Telemetry
                </div>
                <GlassPanel className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-text-secondary">Neural Load</span>
                    <span className="text-xs font-mono text-agent-coder">42.8%</span>
                  </div>
                  <div className="h-1.5 bg-void rounded-full overflow-hidden">
                    <div className="h-full bg-agent-coder rounded-full" style={{ width: '42.8%' }} />
                  </div>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-text-secondary">Memory</span>
                    <span className="text-xs font-mono text-agent-marketer">18.2 GB</span>
                  </div>
                  <div className="h-1.5 bg-void rounded-full overflow-hidden">
                    <div className="h-full bg-agent-marketer rounded-full" style={{ width: '57%' }} />
                  </div>
                </GlassPanel>
                <GlassPanel className="p-3">
                  <div className="text-xs text-text-secondary mb-2">Active Agents</div>
                  <div className="text-2xl font-mono text-white">
                    {agents.filter((a) => a.status !== 'idle').length}
                    <span className="text-text-muted text-sm"> / {agents.length}</span>
                  </div>
                </GlassPanel>
              </div>
            )}

            {activeContextTab === 'files' && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-2">
                  Workspace
                </div>
                <div className="text-xs text-text-muted font-mono">
                  {workspace.workspacePath || '~/nexus-workspace'}
                </div>
                <div className="mt-3 text-xs text-text-muted">
                  File explorer will appear once connected to workspace.
                </div>
              </div>
            )}

            {activeContextTab === 'memory' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono">
                    Active Context Memory
                  </div>
                  <span className="text-[10px] bg-agent-manager/10 text-agent-manager px-1.5 py-0.5 rounded font-mono">
                    {memories.length} Facts
                  </span>
                </div>
                
                {memories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center bg-glass border border-glass-border border-dashed rounded-lg">
                    <Brain className="w-5 h-5 text-text-muted/40 mb-2" />
                    <span className="text-[10px] text-text-muted">No memories recorded yet</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memories.slice(0, 10).map(mem => (
                      <GlassPanel key={mem.id} className="p-3 relative group">
                        <div className="flex items-start gap-2">
                          <div className={`w-1 self-stretch rounded-full shrink-0 ${
                            mem.layer === 'core' ? 'bg-[#7C3AED]' : 
                            mem.layer === 'project' ? 'bg-[#06B6D4]' : 
                            'bg-[#10B981]'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                              {mem.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] font-mono text-text-muted uppercase px-1 py-[1px] bg-void rounded">
                                {mem.layer}
                              </span>
                              <span className="text-[9px] text-text-muted">
                                {new Date(mem.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassPanel>
                    ))}
                    {memories.length > 10 && (
                      <button 
                        onClick={() => navigate('/memory')}
                        className="w-full py-2 text-[10px] font-mono hover:text-white transition-colors text-text-muted text-center"
                      >
                        View all {memories.length} memories →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeContextTab === 'web' && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <span className="text-xs text-text-muted font-mono">
                  Web access available in Beta
                </span>
              </div>
            )}
          </div>

          {/* User section */}
          <div className="p-3 border-t border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-agent-marketer/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-agent-marketer" />
              </div>
              <div>
                <div className="text-xs font-medium">ROOT_USER</div>
                <div className="text-[10px] text-text-muted">Secure Connection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
