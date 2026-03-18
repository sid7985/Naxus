import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Cpu, Palette, Keyboard, Shield, Bell,
  Moon, Sun, Monitor, Globe,
  RefreshCw, Check, Key, Eye, EyeOff, Cloud
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useSettingsStore } from '../stores/settingsStore';

import { ollama } from '../services/ollama';
import { LLM_PROVIDERS } from '../services/llmProvider';
import { DEFAULT_AGENTS, SHORTCUTS, APP_VERSION } from '../lib/constants';
import type { OllamaModel, AgentRole } from '../lib/types';
import { formatBytes } from '../lib/utils';

const AGENT_ICON_MAP_STR: Record<string, string> = {
  manager: '👑', coder: '💻', designer: '🎨',
  marketer: '📣', researcher: '🔍', tester: '🐛',
};

const THEME_OPTIONS = [
  { id: 'dark' as const, label: 'Deep Space', icon: Moon, desc: 'Default glassmorphic dark' },
  { id: 'oled' as const, label: 'OLED Black', icon: Monitor, desc: 'True black for AMOLED' },
  { id: 'light' as const, label: 'Soft Light', icon: Sun, desc: 'Light mode (coming soon)' },
  { id: 'high-contrast' as const, label: 'High Contrast', icon: Monitor, desc: 'Accessibility mode' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'models' | 'providers' | 'appearance' | 'shortcuts' | 'privacy' | 'about'>('models');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const settings = useSettingsStore();

  // Build the unified model list from Ollama + configured cloud providers
  const allAvailableModels: { label: string; value: string }[] = [
    ...models.map(m => ({ label: `🦙 ${m.name}`, value: m.name })),
    ...LLM_PROVIDERS.filter(p => p.apiKeyRequired && settings.providerApiKeys[p.id]).flatMap(p =>
      p.defaultModels.map(m => ({ label: `${p.icon} ${m}`, value: `${p.id}:${m}` }))
    ),
  ];

  useEffect(() => {
    checkOllama();
  }, []);

  const checkOllama = async () => {
    setIsRefreshing(true);
    const healthy = await ollama.isHealthy();
    setOllamaHealthy(healthy);
    settings.setOllamaConnected(healthy);
    if (healthy) {
      const modelList = await ollama.listModels();
      setModels(modelList);
    }
    setIsRefreshing(false);
  };

  const toggleKeyVisibility = (id: string) => setVisibleKeys(p => ({ ...p, [id]: !p[id] }));

  const tabs = [
    { id: 'models' as const, label: 'AI Models', icon: Cpu },
    { id: 'providers' as const, label: 'Providers', icon: Cloud },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'about' as const, label: 'About', icon: Bell },
  ];

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 border-r border-glass-border flex flex-col p-4 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h2 className="text-lg font-semibold mb-6">Settings</h2>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-agent-manager/15 text-white'
                    : 'text-text-secondary hover:text-white hover:bg-glass'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-glass-border">
          <div className="text-[10px] text-text-muted font-mono">NEXUS v{APP_VERSION}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl"
        >
          {/* Models Tab */}
          {activeTab === 'models' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">AI Models</h3>
              <p className="text-text-secondary text-sm mb-6">Configure Ollama connection and assign models to agents.</p>

              {/* Ollama Status */}
              <GlassPanel className="p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-agent-coder" />
                  <div>
                    <div className="text-sm font-medium">Ollama Runtime</div>
                    <div className="text-xs text-text-muted font-mono">localhost:11434</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${
                    ollamaHealthy ? 'bg-status-done/10 text-status-done' : 'bg-status-error/10 text-status-error'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${ollamaHealthy ? 'bg-status-done' : 'bg-status-error'}`} />
                    {ollamaHealthy ? 'Connected' : 'Not Found'}
                  </div>
                  <button
                    onClick={checkOllama}
                    className="p-2 rounded-lg hover:bg-glass transition-colors"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 text-text-muted ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </GlassPanel>

              {/* Model list */}
              {models.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">
                    Available Models ({models.length})
                  </div>
                  <div className="space-y-2">
                    {models.map((m) => (
                      <GlassPanel key={m.name} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm">{m.name}</div>
                          <div className="text-xs text-text-muted font-mono">
                            {m.details?.parameter_size || 'Unknown'} • {formatBytes(m.size)}
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-status-done" />
                      </GlassPanel>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent assignments */}
              <div>
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">
                  Agent → Model Assignments
                </div>
                <div className="space-y-2">
                  {DEFAULT_AGENTS.map((agent) => (
                    <GlassPanel key={agent.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">{AGENT_ICON_MAP_STR[agent.role]}</span>
                      <span className="text-sm flex-1" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      <select
                        className="bg-void-light border border-glass-border rounded-lg px-3 py-1.5 text-xs text-text-secondary outline-none font-mono cursor-pointer min-w-[200px]"
                        value={settings.workspace.modelAssignments[agent.role]}
                        onChange={(e) => settings.setModelAssignment(agent.role as AgentRole, e.target.value)}
                      >
                        {allAvailableModels.length > 0 ? (
                          allAvailableModels.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)
                        ) : (
                          <option value="llama3.2:latest">🦙 llama3.2:latest</option>
                        )}
                      </select>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">LLM Providers</h3>
              <p className="text-text-secondary text-sm mb-6">Add API keys to unlock cloud models. Models appear in the Agent → Model dropdowns.</p>

              <div className="space-y-3">
                {LLM_PROVIDERS.map((provider) => {
                  const hasKey = !!settings.providerApiKeys[provider.id];
                  const isVisible = visibleKeys[provider.id];
                  return (
                    <GlassPanel key={provider.id} className={`p-4 transition-colors ${hasKey ? 'border-l-2' : ''}`} style={hasKey ? { borderLeftColor: provider.color } : undefined}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{provider.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">{provider.name}</h4>
                              {hasKey && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-done/10 text-status-done">CONFIGURED</span>
                              )}
                              {!provider.apiKeyRequired && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-agent-coder/10 text-agent-coder">LOCAL</span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">{provider.description}</p>
                          </div>
                        </div>
                      </div>

                      {provider.apiKeyRequired && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Key className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={isVisible ? 'text' : 'password'}
                              placeholder={`Enter ${provider.name} API key...`}
                              value={settings.providerApiKeys[provider.id] || ''}
                              onChange={(e) => settings.setProviderApiKey(provider.id, e.target.value)}
                              className="w-full bg-void border border-glass-border rounded-lg pl-9 pr-10 py-2 text-xs font-mono text-text-secondary outline-none focus:border-agent-coder/50 transition-colors placeholder:text-text-muted/40"
                            />
                            <button
                              onClick={() => toggleKeyVisibility(provider.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Model chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {provider.defaultModels.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded text-[10px] font-mono bg-glass text-text-muted">{m}</span>
                        ))}
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">Appearance</h3>
              <p className="text-text-secondary text-sm mb-6">Choose your visual theme.</p>

              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => {
                  const ThemeIcon = theme.icon;
                  const isActive = settings.theme === theme.id;
                  return (
                    <GlassPanel
                      key={theme.id}
                      hover
                      onClick={() => settings.setTheme(theme.id)}
                      className={`p-4 cursor-pointer ${isActive ? '!border-agent-manager/50' : ''}`}
                      glowColor={isActive ? '#7C3AED' : undefined}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <ThemeIcon className={`w-5 h-5 ${isActive ? 'text-agent-manager' : 'text-text-muted'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                          {theme.label}
                        </span>
                        {isActive && <Check className="w-4 h-4 text-agent-manager ml-auto" />}
                      </div>
                      <p className="text-xs text-text-muted">{theme.desc}</p>
                    </GlassPanel>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">Keyboard Shortcuts</h3>
              <p className="text-text-secondary text-sm mb-6">Master NEXUS with these commands.</p>

              <div className="space-y-1">
                {Object.entries(SHORTCUTS).map(([key, shortcut]) => (
                  <GlassPanel key={key} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-text-secondary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <kbd className="px-3 py-1 bg-void-light border border-glass-border rounded-md text-xs font-mono text-text-muted">
                      {shortcut.replace('Meta', '⌘').replace('Shift', '⇧').replace('Ctrl', '⌃').replace('+', ' + ')}
                    </kbd>
                  </GlassPanel>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">Privacy & Security</h3>
              <p className="text-text-secondary text-sm mb-6">NEXUS runs 100% locally. Your data never leaves your machine.</p>

              <div className="space-y-4">
                <GlassPanel className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-agent-researcher" />
                      <div>
                        <div className="text-sm font-medium">Internet Access</div>
                        <div className="text-xs text-text-muted">Control agent web access</div>
                      </div>
                    </div>
                    <select
                      className="bg-void-light border border-glass-border rounded-lg px-3 py-1.5 text-xs text-text-secondary outline-none font-mono cursor-pointer"
                      value={settings.internetMode}
                      onChange={(e) => settings.setInternetMode(e.target.value as typeof settings.internetMode)}
                    >
                      <option value="offline">🔴 Full Offline</option>
                      <option value="supervised">🟡 Supervised</option>
                      <option value="researcher-only">🔵 Researcher Only</option>
                      <option value="online">🟢 Full Online</option>
                    </select>
                  </div>
                  <div className="text-xs text-text-muted leading-relaxed">
                    {settings.internetMode === 'offline' && 'No agent can access the internet. Maximum privacy.'}
                    {settings.internetMode === 'supervised' && 'Agents request permission before each web access.'}
                    {settings.internetMode === 'researcher-only' && 'Only the Researcher agent can access the web.'}
                    {settings.internetMode === 'online' && 'All agents can freely access the internet.'}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-agent-manager" />
                    <div>
                      <div className="text-sm font-medium">3 Laws of NEXUS</div>
                      <div className="text-xs text-text-muted">Core privacy guarantees</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="flex items-start gap-2">
                      <span className="text-agent-manager font-mono">01</span>
                      <span><strong>Privacy Law:</strong> All data stays on your machine. Zero cloud sync.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-agent-coder font-mono">02</span>
                      <span><strong>Control Law:</strong> You approve every action before agents execute.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-agent-designer font-mono">03</span>
                      <span><strong>Memory Law:</strong> You own and control all agent memories.</span>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div>
              <h3 className="text-xl font-semibold mb-1">About NEXUS</h3>
              <p className="text-text-secondary text-sm mb-6">Your local AI operating system.</p>

              <GlassPanel className="p-6 text-center mb-6">
                <div className="text-3xl font-semibold text-gradient mb-2">NEXUS</div>
                <div className="text-sm text-text-secondary mb-1">Version {APP_VERSION}</div>
                <div className="text-xs text-text-muted">Six agents. One machine. Zero cloud.</div>
              </GlassPanel>

              <div className="grid grid-cols-3 gap-3">
                <GlassPanel className="p-4 text-center">
                  <div className="text-2xl font-mono text-agent-manager mb-1">6</div>
                  <div className="text-xs text-text-muted">AI Agents</div>
                </GlassPanel>
                <GlassPanel className="p-4 text-center">
                  <div className="text-2xl font-mono text-agent-coder mb-1">∞</div>
                  <div className="text-xs text-text-muted">Privacy</div>
                </GlassPanel>
                <GlassPanel className="p-4 text-center">
                  <div className="text-2xl font-mono text-agent-marketer mb-1">0</div>
                  <div className="text-xs text-text-muted">Cloud Deps</div>
                </GlassPanel>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
