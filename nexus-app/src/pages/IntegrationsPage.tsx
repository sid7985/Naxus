import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, Search, ExternalLink, CheckCircle2,
  XCircle, RefreshCw, Settings, Zap, Link2
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import NeonIcon from '../components/ui/NeonIcon';
import { CONNECTOR_REGISTRY, type ConnectorConfig, type ConnectorStatus } from '../services/connectors';
import PageTransition from '../components/layout/PageTransition';

type CategoryFilter = 'all' | 'automation' | 'communication' | 'storage' | 'development' | 'ai' | 'analytics';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All', automation: 'Automation', communication: 'Communication',
  storage: 'Storage', development: 'Dev Tools', ai: 'AI Models', analytics: 'Analytics' };

const STATUS_UI: Record<ConnectorStatus, { label: string; color: string }> = {
  connected: { label: 'Connected', color: '#10B981' },
  disconnected: { label: 'Not Connected', color: '#606070' },
  error: { label: 'Error', color: '#F43F5E' },
  pending: { label: 'Connecting...', color: '#F59E0B' } };

export default function IntegrationsPage() {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>(CONNECTOR_REGISTRY);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<ConnectorConfig | null>(null);
  const [configUrl, setConfigUrl] = useState('');
  const [configKey, setConfigKey] = useState('');

  const filtered = connectors.filter((c) => {
    const matchCat = filter === 'all' || c.category === filter;
    const matchSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: connectors.length,
    connected: connectors.filter((c) => c.status === 'connected').length };

  useEffect(() => {
    if (selected) {
      setConfigUrl(selected.baseUrl || '');
      setConfigKey(selected.apiKey || '');
    }
  }, [selected]);

  const testConnection = (id: string) => {
    setConnectors((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: 'pending' as ConnectorStatus } : c
    ));
    // Simulate connection test
    setTimeout(() => {
      setConnectors((prev) => prev.map((c) =>
        c.id === id ? { ...c, status: Math.random() > 0.3 ? 'connected' as ConnectorStatus : 'error' as ConnectorStatus } : c
      ));
    }, 1500);
  };

  const saveConfig = () => {
    if (!selected) return;
    setConnectors((prev) => prev.map((c) =>
      c.id === selected.id ? { ...c, baseUrl: configUrl, apiKey: configKey } : c
    ));
    setSelected({ ...selected, baseUrl: configUrl, apiKey: configKey });
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      <PageHeader
        title="Integrations Hub"
        subtitle="Connect external services"
        icon={Plug}
        iconColor="#06B6D4"
        badge={`${stats.connected}/${stats.total} connected`}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-glass rounded-xl border border-glass-border">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="bg-transparent text-xs text-white placeholder:text-text-muted outline-none w-40"
            />
          </div>
        }
      />

      {/* Category tabs */}
      <div className="flex items-center gap-2 px-5 py-2.5">
        <div className="tab-pills">
          {(Object.entries(CATEGORY_LABELS) as [CategoryFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`tab-pill ${filter === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Connector grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.map((connector, idx) => {
                const statusUi = STATUS_UI[connector.status];
                return (
                  <motion.div key={connector.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}>
                    <GlassPanel
                      hover
                      onClick={() => setSelected(connector)}
                      className={`p-4 cursor-pointer ${selected?.id === connector.id ? '!border-white/20' : ''}`}
                    >
                  <div className="flex items-start gap-3">
                        <NeonIcon icon={Zap} color={connector.color} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{connector.name}</span>
                            <span
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
                              style={{ background: `${statusUi.color}15`, color: statusUi.color }}
                            >
                              {connector.status === 'connected' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {connector.status === 'error' && <XCircle className="w-2.5 h-2.5" />}
                              {connector.status === 'pending' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                              {statusUi.label}
                            </span>
                          </div>
                          <div className="text-xs text-text-muted mt-0.5 line-clamp-2">{connector.description}</div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="px-1.5 py-0.5 rounded bg-glass text-[10px] font-mono text-text-muted capitalize">
                              {connector.category}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {connector.features.length} features
                            </span>
                          </div>
                        </div>
                      </div>
                    </GlassPanel>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Config panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="spatial-detail-panel shrink-0"
            >
              <div className="w-[340px] p-4 space-y-4 overflow-y-auto h-full">
                {/* Header */}
                <div className="text-center pt-2">
                  <div className="text-3xl mb-2">{selected.icon}</div>
                  <div className="text-lg font-semibold">{selected.name}</div>
                  <div className="text-xs text-text-muted mt-1">{selected.description}</div>
                </div>

                {/* Status */}
                {(() => {
                  const sui = STATUS_UI[selected.status];
                  return (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${sui.color}10` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: sui.color }} />
                      <span className="text-xs font-mono" style={{ color: sui.color }}>{sui.label}</span>
                    </div>
                  );
                })()}

                {/* Features */}
                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Features
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => (
                      <span key={f} className="px-2 py-1 rounded bg-glass text-[10px] font-mono text-text-secondary">
                        {f}
                      </span>
                    ))}
                  </div>
                </GlassPanel>

                {/* Configuration */}
                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-3 flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Configuration
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-text-muted uppercase font-mono">Base URL</label>
                      <input
                        type="text"
                        value={configUrl}
                        onChange={(e) => setConfigUrl(e.target.value)}
                        placeholder="http://localhost:5678"
                        className="w-full mt-1 px-3 py-2 bg-glass rounded-lg text-xs text-white placeholder:text-text-muted outline-none border border-glass-border focus:border-agent-coder/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted uppercase font-mono">API Key</label>
                      <input
                        type="password"
                        value={configKey}
                        onChange={(e) => setConfigKey(e.target.value)}
                        placeholder="Optional"
                        className="w-full mt-1 px-3 py-2 bg-glass rounded-lg text-xs text-white placeholder:text-text-muted outline-none border border-glass-border focus:border-agent-coder/50 transition-colors"
                      />
                    </div>
                  </div>
                </GlassPanel>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => testConnection(selected.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-agent-coder/10 text-agent-coder text-xs font-medium hover:bg-agent-coder/20 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Test Connection
                  </button>
                  <button
                    onClick={saveConfig}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-glass text-text-secondary text-xs hover:bg-glass/80 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Save Configuration
                  </button>
                  <a
                    href={selected.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-glass text-text-secondary text-xs hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Documentation
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}
