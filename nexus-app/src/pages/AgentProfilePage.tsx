import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, Code2, Palette, Megaphone, Bug, Search,
  Send, ArrowLeft, Trash2
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import NeonIcon from '../components/ui/NeonIcon';
import SpatialSidebar from '../components/layout/SpatialSidebar';
import StatusBadge from '../components/ui/StatusBadge';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';
import { tauri } from '../services/tauri';
import { memoryService } from '../services/memory';
import { CODER_TOOLS } from '../agents/tools';
import { formatTimestamp } from '../lib/utils';
import PageTransition from '../components/layout/PageTransition';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  manager: `You are NEXUS Manager, the Founder's Right Hand. You are calm, decisive, and structured. You communicate like a senior engineering lead. When given a goal, you break it into subtasks, assign to specialist agents, monitor progress, and report back.`,
  coder: `You are NEXUS Coder, a Senior Engineer. You are precise and no-nonsense. You help users write, debug, and architect code across Python, Kotlin, JavaScript, Bash, Dart. Always explain your reasoning briefly.`,
  designer: `You are NEXUS Designer, the UI/UX Lead. You are opinionated and aesthetic-first with strong user empathy. You generate UI specifications, component code, accessibility audits, and design system recommendations.`,
  marketer: `You are NEXUS Marketer, the Growth Lead. You are energetic, persuasive, and data-aware. You write app store descriptions, social media content, blog articles, email campaigns, and pitch decks.`,
  researcher: `You are NEXUS Researcher, the Intelligence Lead. You are thorough, skeptical, and citation-obsessed. You synthesize research into structured reports and cite every claim.`,
  tester: `You are NEXUS Tester, the QA Lead. You are adversarial, methodical, and relentless. You generate test plans, write test scripts, identify edge cases, and produce bug reports with reproduction steps.`,
};

export default function AgentProfilePage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const agents = useAgentStore((s) => s.agents);
  const conversations = useAgentStore((s) => s.conversations);
  const addMessage = useAgentStore((s) => s.addMessage);
  const clearConversation = useAgentStore((s) => s.clearConversation);
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);
  const updateAgentPersonality = useAgentStore((s) => s.updateAgentPersonality);
  const workspace = useSettingsStore((s) => s.workspace);

  const agent = agents.find((a) => a.id === agentId);
  const messages = agentId ? conversations[agentId] || [] : [];

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-text-muted">Agent not found</p>
      </div>
    );
  }

  const IconComponent = ICON_MAP[agent.icon];
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agent.role] || '';

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !agentId) return;
    const userMessage = input.trim();
    setInput('');

    addMessage(agentId, { role: 'user', content: userMessage });
    setIsStreaming(true);
    updateAgentStatus(agentId, 'thinking');

    try {
      const model = workspace.modelAssignments[agent.role];
      let responseText = '';

      addMessage(agentId, {
        role: 'assistant',
        content: '▋',
        agentId,
        agentRole: agent.role,
        isStreaming: true,
      });

      const chatMessages = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user', content: userMessage }]);

      const memoryContext = await memoryService.getContextForAgent(agent.id);
      const fullSystemPrompt = systemPrompt + memoryContext;

      const tools = agent.role === 'coder' ? CODER_TOOLS : undefined;

      for await (const chunk of ollama.chat(model, chatMessages, fullSystemPrompt, tools)) {
        if (typeof chunk === 'string') {
          responseText += chunk;
          useAgentStore.setState((state) => {
            const convos = { ...state.conversations };
            const msgs = [...(convos[agentId] || [])];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: responseText };
            convos[agentId] = msgs;
            return { conversations: convos };
          });
        } else if (typeof chunk !== 'string' && 'tool_calls' in chunk && Array.isArray((chunk as any).tool_calls)) {
          // Process tool calls
          updateAgentStatus(agentId, 'acting');
          for (const call of chunk.tool_calls) {
            const args = call.function.arguments;
            let resultText = `⚙️ Executing: ${call.function.name}(${JSON.stringify(args)})\n`;
            
            try {
              if (call.function.name === 'read_file') {
                const content = await tauri.readFile(args.path);
                resultText += `✅ File read successfully:\n\`\`\`\n${content.substring(0, 500)}${content.length > 500 ? '\n... (truncated)' : ''}\n\`\`\``;
              } else if (call.function.name === 'write_file') {
                await tauri.writeFile(args.path, args.content);
                resultText += `✅ File written successfully to ${args.path}`;
              } else if (call.function.name === 'list_directory') {
                const files = await tauri.listDirectory(args.path, args.max_depth || 1);
                resultText += `✅ Directory listing (${files.length} items):\n${files.map(f => `${f.is_dir ? '📁' : '📄'} ${f.name}`).join('\n')}`;
              } else if (call.function.name === 'search_files') {
                const results = await tauri.searchFiles(args.query, args.path);
                resultText += `✅ Found ${results.length} results.\n${results.slice(0, 5).map(r => `${r.path}:${r.line_number}`).join('\n')}`;
              } else if (call.function.name === 'execute_command') {
                const res = await tauri.executeCommand(args.cmd, args.cwd);
                resultText += res.success ? `✅ Output:\n${res.stdout}` : `❌ Error:\n${res.stderr}`;
              } else if (call.function.name === 'get_system_info') {
                const info = await tauri.getSystemInfo();
                resultText += `✅ System Info:\nOS: ${info.os}\nArch: ${info.arch}\nCores: ${info.cpu_cores}\nHost: ${info.hostname}`;
              } else if (call.function.name === 'git_status') {
                const status = await tauri.gitStatus(args.repo_path);
                resultText += `✅ Git Status (Branch: ${status.branch}):\nStaged: ${status.staged.length}, Modified: ${status.modified.length}, Untracked: ${status.untracked.length}`;
              } else if (call.function.name === 'git_commit') {
                const out = await tauri.gitCommit(args.repo_path, args.message);
                resultText += `✅ Commit successful:\n${out}`;
              } else {
                resultText += `❌ Unknown tool requested: ${call.function.name}`;
              }
            } catch (err: any) {
              resultText += `❌ Tool failed: ${err.message || String(err)}`;
            }

            addMessage(agentId, {
              role: 'system',
              content: resultText,
              agentId,
              agentRole: agent.role,
            });
          }
        }
      }

      useAgentStore.setState((state) => {
        const convos = { ...state.conversations };
        const msgs = [...(convos[agentId] || [])];
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: responseText, isStreaming: false };
        convos[agentId] = msgs;
        return { conversations: convos };
      });
    } catch (error) {
      addMessage(agentId, {
        role: 'assistant',
        content: `⚠️ ${error instanceof Error ? error.message : 'Connection error'}`,
        agentId,
        agentRole: agent.role,
      });
    } finally {
      setIsStreaming(false);
      updateAgentStatus(agentId, 'idle');
    }
  };

  return (
    <PageTransition>
    <div className="h-full flex">
      {/* Left: Agent Info */}
      <SpatialSidebar position="left" width="w-72" className="p-5 overflow-y-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            {IconComponent && <NeonIcon icon={IconComponent} color={agent.color} size="lg" />}
          </div>
          <h2 className="text-xl font-semibold">{agent.name}</h2>
          <span
            className="text-[10px] uppercase tracking-widest font-mono px-3 py-1 rounded-full mt-2"
            style={{ background: `${agent.color}20`, color: agent.color }}
          >
            {agent.role}
          </span>
        </div>

        {/* Core Tools */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-3">
            Core Tools
          </div>
          <div className="space-y-1.5">
            {(agent.role === 'manager' ? ['Strategic Planning', 'Task Delegation', 'Progress Monitoring'] :
              agent.role === 'coder' ? ['Code Generation', 'File Operations', 'Git Management'] :
              agent.role === 'designer' ? ['UI Specifications', 'Component Code', 'Design Tokens'] :
              agent.role === 'marketer' ? ['App Store Copy', 'Social Content', 'Landing Pages'] :
              agent.role === 'researcher' ? ['Web Search', 'Document Analysis', 'Tech Comparison'] :
              ['Test Planning', 'Bug Detection', 'Visual Regression']
            ).map((tool) => (
              <GlassPanel key={tool} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color }} />
                  <span className="text-sm text-text-secondary">{tool}</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-3">
            Personality
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>Tone</span>
                <span>{agent.personality.tone < 50 ? 'Professional' : 'Casual'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={agent.personality.tone}
                onChange={(e) =>
                  updateAgentPersonality(agent.id, parseInt(e.target.value), agent.personality.detail)
                }
                className="w-full h-1.5 bg-void-light rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>Detail</span>
                <span>{agent.personality.detail < 50 ? 'Concise' : 'Granular'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={agent.personality.detail}
                onChange={(e) =>
                  updateAgentPersonality(agent.id, agent.personality.tone, parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-void-light rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-auto pt-4 border-t border-glass-border flex items-center justify-between">
          <span className="text-xs text-text-muted">Status</span>
          <StatusBadge status={agent.status} showLabel size="md" />
        </div>
      </SpatialSidebar>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
          <span className="text-sm" style={{ color: agent.color }}>
            Direct Channel — {agent.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text-muted">ID: {agent.id.toUpperCase()}</span>
            <button
              onClick={() => agentId && clearConversation(agentId)}
              className="p-1.5 rounded hover:bg-glass transition-colors text-text-muted hover:text-status-error"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-text-muted text-sm">
                Start a conversation with {agent.name}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.role !== 'user' && (
                  <div className="text-xs text-text-muted mb-1">
                    <span style={{ color: agent.color }}>{agent.name}</span>
                    {' • '}
                    {formatTimestamp(msg.timestamp)}
                  </div>
                )}
                <GlassPanel
                  className={`px-4 py-3 ${
                    msg.role === 'user' ? '!bg-agent-manager/10 !border-agent-manager/20' : ''
                  }`}
                >
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && <span className="animate-pulse ml-0.5">▋</span>}
                  </p>
                </GlassPanel>
                {msg.role === 'user' && (
                  <div className="text-[10px] text-text-muted mt-1">
                    You • {formatTimestamp(msg.timestamp)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={feedEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3">
          <GlassPanel elevated className="flex items-center gap-2 px-4 py-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Direct message ${agent.name}...`}
              className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-text-muted outline-none"
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-lg transition-colors disabled:opacity-30"
              style={{ color: agent.color }}
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </GlassPanel>
          <div className="text-center mt-2">
            <span className="text-[10px] font-mono text-text-muted">
              Command mode active. Type /help for {agent.role} directives.
            </span>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
