import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, ExternalLink, CheckCircle2, XCircle, RefreshCw,
  Play, Terminal, Globe, Code2, Workflow, Bot, Cpu, X
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import NeonIcon from '../components/ui/NeonIcon';
import PageTransition from '../components/layout/PageTransition';

import { n8nService } from '../services/n8n';
import { nodeRedService } from '../services/nodeRedService';
import { nanoclawService } from '../services/nanoclawService';
import { theiaService } from '../services/theiaService';
import { opencodeService } from '../services/opencodeService';

type ServiceStatus = 'running' | 'stopped' | 'checking';

interface ExternalTool {
  id: string;
  name: string;
  description: string;
  port: number | null;
  url: string;
  icon: typeof Workflow;
  color: string;
  category: 'automation' | 'ide' | 'agent' | 'cli';
  launchCmd: string;
  docsUrl: string;
  embedable: boolean;
}

const TOOLS: ExternalTool[] = [
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Visual workflow automation with 400+ integrations. Build AI agent workflows, connect APIs, and automate tasks.',
    port: 5678,
    url: 'http://localhost:5678',
    icon: Workflow,
    color: '#FF6D5A',
    category: 'automation',
    launchCmd: 'npx n8n',
    docsUrl: 'https://docs.n8n.io',
    embedable: true,
  },
  {
    id: 'node-red',
    name: 'Node-RED',
    description: 'Low-code flow-based programming for event-driven applications. Wire together APIs, devices, and services.',
    port: 1880,
    url: 'http://localhost:1880',
    icon: Globe,
    color: '#8F0000',
    category: 'automation',
    launchCmd: 'node-red',
    docsUrl: 'https://nodered.org/docs/',
    embedable: true,
  },
  {
    id: 'nanoclaw',
    name: 'NanoClaw',
    description: 'AI agent framework with Docker sandboxes. Connects to WhatsApp, Telegram, Slack, Discord, Gmail.',
    port: 3000,
    url: 'http://localhost:3000',
    icon: Bot,
    color: '#22C55E',
    category: 'agent',
    launchCmd: 'cd tools/nanoclaw && npm start',
    docsUrl: 'https://nanoclaw.dev',
    embedable: false,
  },
  {
    id: 'theia',
    name: 'Eclipse Theia',
    description: 'Cloud & desktop IDE framework. Full VS Code extension compatibility with modular architecture.',
    port: 3030,
    url: 'http://localhost:3030',
    icon: Code2,
    color: '#5B69FF',
    category: 'ide',
    launchCmd: 'docker run -d -p 3030:3000 theiaide/theia:latest',
    docsUrl: 'https://theia-ide.org/docs/',
    embedable: true,
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    description: 'Terminal AI coding agent built in Go. Multi-provider (Ollama, OpenAI, Anthropic, Gemini). TUI interface.',
    port: null,
    url: '',
    icon: Terminal,
    color: '#A78BFA',
    category: 'cli',
    launchCmd: 'opencode',
    docsUrl: 'https://github.com/opencode-ai/opencode',
    embedable: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  automation: '#FF6D5A',
  ide: '#5B69FF',
  agent: '#22C55E',
  cli: '#A78BFA',
};

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({});
  const [selectedTool, setSelectedTool] = useState<ExternalTool | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const checkAllHealth = useCallback(async () => {
    const newStatuses: Record<string, ServiceStatus> = {};
    
    // Mark all as checking
    TOOLS.forEach((t) => { newStatuses[t.id] = 'checking'; });
    setStatuses({ ...newStatuses });

    // Check in parallel
    const [n8nOk, nodeRedOk, nanoclawOk, theiaOk] = await Promise.all([
      n8nService.isHealthy(),
      nodeRedService.isHealthy(),
      nanoclawService.isHealthy(),
      theiaService.isHealthy(),
    ]);

    const openCodeOk = await opencodeService.isInstalled();

    setStatuses({
      'n8n': n8nOk ? 'running' : 'stopped',
      'node-red': nodeRedOk ? 'running' : 'stopped',
      'nanoclaw': nanoclawOk ? 'running' : 'stopped',
      'theia': theiaOk ? 'running' : 'stopped',
      'opencode': openCodeOk ? 'running' : 'stopped',
    });
  }, []);

  useEffect(() => {
    checkAllHealth();
    const interval = setInterval(checkAllHealth, 15000);
    return () => clearInterval(interval);
  }, [checkAllHealth]);

  const getStatusColor = (status: ServiceStatus) => {
    if (status === 'running') return '#10B981';
    if (status === 'checking') return '#F59E0B';
    return '#606070';
  };

  const getStatusLabel = (status: ServiceStatus) => {
    if (status === 'running') return 'Running';
    if (status === 'checking') return 'Checking...';
    return 'Stopped';
  };

  const runningCount = Object.values(statuses).filter((s) => s === 'running').length;

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      <PageHeader
        title="Integrations Hub"
        subtitle="External tools & services"
        icon={Plug}
        iconColor="#06B6D4"
        badge={`${runningCount}/${TOOLS.length} running`}
        actions={
          <button
            onClick={checkAllHealth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-glass text-text-secondary text-xs hover:bg-glass/80 transition-colors border border-glass-border"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh All
          </button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Tool Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TOOLS.map((tool, idx) => {
              const status = statuses[tool.id] || 'stopped';
              const statusColor = getStatusColor(status);
              const Icon = tool.icon;

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <GlassPanel
                    hover
                    onClick={() => setSelectedTool(tool)}
                    className={`p-5 cursor-pointer ${selectedTool?.id === tool.id ? '!border-white/20' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <NeonIcon icon={Icon} color={tool.color} size="md" />
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono"
                        style={{ background: `${statusColor}15`, color: statusColor }}
                      >
                        {status === 'running' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {status === 'stopped' && <XCircle className="w-2.5 h-2.5" />}
                        {status === 'checking' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold mb-1">{tool.name}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 mb-3">{tool.description}</p>

                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.5 rounded bg-glass text-[10px] font-mono capitalize"
                        style={{ color: CATEGORY_COLORS[tool.category] }}
                      >
                        {tool.category}
                      </span>
                      {tool.port && (
                        <span className="text-[10px] text-text-muted font-mono">
                          :{tool.port}
                        </span>
                      )}
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedTool && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="spatial-detail-panel shrink-0"
            >
              <div className="w-[340px] p-4 space-y-4 overflow-y-auto h-full">
                {/* Header */}
                <div className="text-center pt-2">
                  <NeonIcon icon={selectedTool.icon} color={selectedTool.color} size="lg" />
                  <div className="text-lg font-semibold mt-3">{selectedTool.name}</div>
                  <div className="text-xs text-text-muted mt-1">{selectedTool.description}</div>
                </div>

                {/* Status */}
                {(() => {
                  const s = statuses[selectedTool.id] || 'stopped';
                  const c = getStatusColor(s);
                  return (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${c}10` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                      <span className="text-xs font-mono" style={{ color: c }}>{getStatusLabel(s)}</span>
                    </div>
                  );
                })()}

                {/* Connection Details */}
                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-2 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Connection
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {selectedTool.port && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">URL</span>
                        <span className="font-mono">{selectedTool.url}</span>
                      </div>
                    )}
                    {selectedTool.port && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Port</span>
                        <span className="font-mono">{selectedTool.port}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-muted">Category</span>
                      <span className="capitalize">{selectedTool.category}</span>
                    </div>
                  </div>
                </GlassPanel>

                {/* Launch Command */}
                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-2 flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> Launch Command
                  </div>
                  <code className="block text-xs text-agent-coder bg-void p-2 rounded font-mono break-all">
                    {selectedTool.launchCmd}
                  </code>
                </GlassPanel>

                {/* Actions */}
                <div className="space-y-2">
                  {selectedTool.embedable && statuses[selectedTool.id] === 'running' && (
                    <button
                      onClick={() => setEmbedUrl(selectedTool.url)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white text-xs font-medium transition-colors"
                      style={{ background: selectedTool.color }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Open in NEXUS
                    </button>
                  )}

                  <a
                    href={selectedTool.url || selectedTool.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-glass text-text-secondary text-xs hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Browser
                  </a>

                  <a
                    href={selectedTool.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-glass text-text-secondary text-xs hover:text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Documentation
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded iframe overlay */}
      <AnimatePresence>
        {embedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--bg-void)' }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" style={{ color: 'var(--neon-primary)' }} />
                {embedUrl}
              </div>
              <button
                onClick={() => setEmbedUrl(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <iframe
              src={embedUrl}
              className="flex-1 w-full border-0"
              title="Embedded Tool"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
}
