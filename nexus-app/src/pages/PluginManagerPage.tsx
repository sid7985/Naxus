import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle, Download, CheckCircle2, Play, Square, Loader2
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import { mcpClient, MCPServerConfig } from '../services/mcpClient';
import PageTransition from '../components/layout/PageTransition';

interface Plugin extends MCPServerConfig {
  icon: string;
  version: string;
  author: string;
  category: 'core' | 'tool' | 'integration' | 'community';
  color: string;
  isInstalling?: boolean;
  installed?: boolean;
}

const CORE_PLUGINS: Omit<Plugin, 'installed' | 'is_active'>[] = [
  { id: 'mcp-fs', name: 'File System', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users'], env: {}, icon: '📁', version: '1.0.0', author: 'NEXUS Core', category: 'core', color: '#06B6D4' },
  { id: 'mcp-sqlite', name: 'SQLite', command: 'uvx', args: ['mcp-server-sqlite', '--db-path', 'workspace.db'], env: {}, icon: '🗃️', version: '1.0.0', author: 'NEXUS Core', category: 'tool', color: '#14B8A6' },
  { id: 'mcp-github', name: 'GitHub', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' }, icon: '🐙', version: '0.9.0', author: 'Community', category: 'community', color: '#333333' },
  { id: 'mcp-brave', name: 'Brave Search', command: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'], env: { BRAVE_API_KEY: '' }, icon: '🌐', version: '1.0.0', author: 'NEXUS Core', category: 'tool', color: '#F59E0B' },
];

export default function PluginManagerPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filter, setFilter] = useState<'all' | 'installed' | 'core' | 'community'>('all');

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    const activeServers = await mcpClient.getServers();
    
    // Merge core templates with active servers from Python sidecar
    const merged: Plugin[] = CORE_PLUGINS.map(core => {
      const active = activeServers.find(s => s.id === core.id);
      return {
        ...core,
        is_active: active ? active.is_active : false,
        installed: !!active,
        env: active ? active.env : core.env
      };
    });
    
    setPlugins(merged);
  };

  const filtered = plugins.filter((p) => {
    if (filter === 'installed') return p.installed;
    if (filter === 'core') return p.category === 'core';
    if (filter === 'community') return p.category === 'community';
    return true;
  });

  const toggleInstall = async (plugin: Plugin) => {
    setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, isInstalling: true } : p));
    
    if (plugin.installed) {
      await mcpClient.uninstallServer(plugin.id);
    } else {
      await mcpClient.installServer({
        id: plugin.id,
        name: plugin.name,
        command: plugin.command,
        args: plugin.args,
        env: plugin.env
      });
    }
    await loadServers();
  };

  const stats = {
    total: plugins.length,
    installed: plugins.filter((p) => p.installed).length };

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      <PageHeader
        title="Plugin Manager"
        subtitle="MCP server connections"
        icon={Puzzle}
        iconColor="#6366F1"
        badge={`${stats.installed}/${stats.total} installed`}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 py-2.5">
        <div className="tab-pills">
          {(['all', 'installed', 'core', 'community'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab-pill capitalize ${filter === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((plugin, idx) => (
              <motion.div key={plugin.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}>
                <GlassPanel hover className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{plugin.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{plugin.name}</span>
                        <span className="text-[10px] font-mono text-text-muted">v{plugin.version}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-text-muted">{plugin.command} {plugin.args[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono text-text-muted">{plugin.author}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          plugin.category === 'core' ? 'bg-agent-coder/10 text-agent-coder' :
                          plugin.category === 'community' ? 'bg-agent-marketer/10 text-agent-marketer' :
                          'bg-glass text-text-muted'
                        }`}>
                          {plugin.category}
                        </span>
                        {plugin.installed && (
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            plugin.is_active ? 'bg-status-done/10 text-status-done' : 'bg-status-error/10 text-status-error'
                          }`}>
                            {plugin.is_active ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                            {plugin.is_active ? 'RUNNING' : 'STOPPED'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleInstall(plugin)}
                      disabled={plugin.isInstalling}
                      className={`p-2 rounded-lg text-xs transition-colors flex items-center justify-center ${
                        plugin.installed
                          ? 'bg-status-done/10 text-status-done hover:bg-status-error/10 hover:text-status-error'
                          : 'bg-glass text-text-secondary hover:bg-agent-researcher/10 hover:text-agent-researcher'
                      } disabled:opacity-50`}
                    >
                      {plugin.isInstalling ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                       plugin.installed ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
