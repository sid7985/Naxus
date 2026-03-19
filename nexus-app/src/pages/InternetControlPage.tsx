import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Wifi, WifiOff, Shield, ShieldAlert,
  ListFilter, Activity, Search, Plus, Trash2, ShieldCheck, Download
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import NeonIcon from '../components/ui/NeonIcon';
import { useSettingsStore } from '../stores/settingsStore';
import { InternetMode } from '../lib/types';
import PageTransition from '../components/layout/PageTransition';

export default function InternetControlPage() {
  const { internetMode, setInternetMode, allowedDomains, addAllowedDomain, removeAllowedDomain } = useSettingsStore();

  const [newDomain, setNewDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');

  // Mock Request Logs
  const [logs] = useState([
    { id: 1, timestamp: Date.now() - 4000, agent: 'Researcher', domain: 'searxng.nexus.local', status: 'allowed' },
    { id: 2, timestamp: Date.now() - 15000, agent: 'Coder', domain: 'api.github.com', status: 'allowed' },
    { id: 3, timestamp: Date.now() - 120000, agent: 'Marketer', domain: 'twitter.com', status: 'blocked' },
    { id: 4, timestamp: Date.now() - 360000, agent: 'Planner', domain: 'google.com', status: 'allowed' },
  ]);

  const modes: { id: InternetMode; label: string; desc: string; icon: any; color: string }[] = [
    { id: 'offline', label: 'Full Offline', desc: 'No outbound requests permitted.', icon: WifiOff, color: 'text-red-400' },
    { id: 'researcher-only', label: 'Researcher Only', desc: 'Only the Researcher Agent can access web.', icon: Search, color: 'text-yellow-400' },
    { id: 'supervised', label: 'Supervised', desc: 'Whitelist domains only.', icon: ShieldAlert, color: 'text-indigo-400' },
    { id: 'online', label: 'Full Online', desc: 'Unrestricted internet access.', icon: Globe, color: 'text-emerald-400' },
  ];

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDomain.trim()) {
      addAllowedDomain(newDomain.trim().toLowerCase());
      setNewDomain('');
    }
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Web Capabilities"
        subtitle="Proxy Rules & Internet Toggle"
        icon={Shield}
        iconColor="#10B981"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        
        {/* Global Control Panel */}
        <section className="mb-10">
          <h2 className="text-xs font-mono font-bold text-text-muted uppercase tracking-widest mb-4">Connection Boundary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = internetMode === mode.id;
              
              return (
                <GlassPanel 
                  key={mode.id}
                  hover
                  className={`p-4 cursor-pointer border-2 transition-all ${
                    isActive ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-transparent'
                  }`}
                  onClick={() => setInternetMode(mode.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                  <NeonIcon icon={Icon} color={isActive ? '#6366F1' : '#A0A0B0'} size="md" />
                     <div className={`w-3 h-3 rounded-full border-2 ${
                       isActive ? 'border-indigo-400 bg-indigo-500' : 'border-glass-border bg-transparent'
                     }`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{mode.label}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{mode.desc}</p>
                </GlassPanel>
              )
            })}
          </div>
        </section>

        {/* Tabs for Whitelist / Logs */}
        <div className="flex items-center gap-2 px-6 pb-4">
          <div className="tab-pills">
            <button 
              onClick={() => setActiveTab('rules')}
              className={`tab-pill flex items-center gap-2 ${activeTab === 'rules' ? 'active' : ''}`}
            >
              <ListFilter className="w-3.5 h-3.5" /> Domain Rules
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`tab-pill flex items-center gap-2 ${activeTab === 'logs' ? 'active' : ''}`}
            >
              <Activity className="w-3.5 h-3.5" /> Request Audit Log
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'rules' ? (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Whitelist Manager */}
              <div className="lg:col-span-2 space-y-4">
                <GlassPanel className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Allowed Domains
                    </h3>
                    <span className="text-[10px] text-text-muted bg-glass px-2 py-1 rounded">Active in Supervised Mode</span>
                  </div>
                  
                  <form onSubmit={handleAddDomain} className="flex gap-2 mb-6">
                    <input 
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="e.g. api.github.com"
                      className="flex-1 bg-void border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <button 
                      type="submit"
                      disabled={!newDomain.trim()}
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  <div className="space-y-2">
                    {allowedDomains.length === 0 ? (
                      <div className="text-center py-8 text-sm text-text-muted border border-dashed border-glass-border rounded-lg">
                        No domains explicitly allowed. In Supervised mode, all requests will be blocked.
                      </div>
                    ) : (
                      allowedDomains.map(domain => (
                        <div key={domain} className="flex items-center justify-between p-3 rounded-lg bg-void border border-glass-border group hover:border-indigo-500/30 transition-colors">
                           <div className="flex items-center gap-3">
                             <Globe className="w-4 h-4 text-text-muted" />
                             <span className="text-sm font-mono">{domain}</span>
                           </div>
                           <button 
                             onClick={() => removeAllowedDomain(domain)}
                             className="p-1.5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-500/10"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))
                    )}
                  </div>
                </GlassPanel>
              </div>

              {/* Guidelines Info */}
              <div className="space-y-4">
                 <GlassPanel className="p-5 bg-indigo-500/5 border-indigo-500/20">
                    <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                       <Wifi className="w-4 h-4" /> Network Proxy
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">
                      All agent LLM tools routing outward (e.g. Researcher Search, API fetcher) are intercepted by the local NEXUS Python Sidecar.
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">
                      Wildcards are supported (e.g. <code className="text-indigo-300">*.github.com</code>). 
                      Localhost (<code className="text-indigo-300">127.0.0.1</code>) is always permitted for internal tooling.
                    </p>
                 </GlassPanel>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <GlassPanel className="overflow-hidden">
                 <div className="flex items-center justify-between p-4 border-b border-glass-border">
                    <h3 className="text-sm font-semibold">Outbound Traffic Log</h3>
                    <button className="flex items-center gap-2 text-xs text-text-muted hover:text-white bg-void px-3 py-1.5 border border-glass-border rounded">
                       <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-void/50 text-xs text-text-muted font-mono uppercase tracking-wider border-b border-glass-border">
                          <tr>
                             <th className="px-6 py-4 font-normal">Timestamp</th>
                             <th className="px-6 py-4 font-normal">Agent</th>
                             <th className="px-6 py-4 font-normal">Target Domain</th>
                             <th className="px-6 py-4 font-normal text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-glass-border">
                          {logs.map((log) => (
                             <tr key={log.id} className="hover:bg-glass/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-text-muted text-xs">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false }) + '.' + new Date(log.timestamp).getMilliseconds()}
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{log.agent}</td>
                                <td className="px-6 py-4 font-mono text-indigo-300">{log.domain}</td>
                                <td className="px-6 py-4 text-right">
                                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                     log.status === 'allowed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                   }`}>
                                      {log.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </PageTransition>
  );
}
