import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Brain, Search, Plus, Trash2, Tag,
  Clock, Star, Database, Layers, Filter, RefreshCw
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import SpatialSidebar from '../components/layout/SpatialSidebar';
import { useMemoryStore } from '../stores/memoryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { memoryService } from '../services/memory';
import { DEFAULT_AGENTS } from '../lib/constants';
import PageTransition from '../components/layout/PageTransition';

const LAYER_CONFIG = {
  core:     { label: 'Core Facts',      color: '#7C3AED', icon: Star,     desc: 'Permanent, user-only edit' },
  project:  { label: 'Project Memory',  color: '#06B6D4', icon: Database, desc: 'Per-project, semi-permanent' },
  agent:    { label: 'Agent Memory',    color: '#10B981', icon: Brain,    desc: 'Learned patterns per agent' },
  episodic: { label: 'Episodic',        color: '#F59E0B', icon: Clock,    desc: 'Timestamped events' },
  semantic: { label: 'Semantic (RAG)',  color: '#6366F1', icon: Layers,   desc: 'Embeddings + vector search' },
};

export default function MemoryPage() {
  const navigate = useNavigate();
  const { memories, addMemory, removeMemory } = useMemoryStore();
  const { workspace } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [newFact, setNewFact] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const handleIndexWorkspace = async () => {
    if (!workspace?.workspacePath) return;
    setIsIndexing(true);
    try {
      await memoryService.indexWorkspace(workspace.workspacePath);
    } catch (e) {
      console.error('Error indexing workspace:', e);
    } finally {
      setIsIndexing(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    const matchesLayer = !activeLayer || m.layer === activeLayer;
    return matchesSearch && matchesLayer;
  });

  const handleAddMemory = () => {
    if (!newFact.trim()) return;
    addMemory({
      content: newFact.trim(),
      layer: 'core',
      tags: ['manual'],
      importance: 'high',
    });
    setNewFact('');
    setShowAddForm(false);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Brain className="w-5 h-5 text-agent-manager" />
          <h1 className="text-sm font-semibold">Memory & Knowledge Base</h1>
          <span className="text-xs text-text-muted font-mono ml-2">{memories.length} memories</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleIndexWorkspace}
            disabled={isIndexing || !workspace?.workspacePath}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
            {isIndexing ? 'Indexing...' : 'Index RAG'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-agent-manager/10 text-agent-manager text-xs hover:bg-agent-manager/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fact
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Layer Filter */}
        <SpatialSidebar position="left" width="w-52" className="p-3 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-2 px-1">
            Memory Layers
          </div>
          <button
            onClick={() => setActiveLayer(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
              !activeLayer ? 'bg-glass text-white' : 'text-text-secondary hover:text-white hover:bg-glass/50'
            }`}
          >
            All Layers ({memories.length})
          </button>
          {Object.entries(LAYER_CONFIG).map(([key, cfg]) => {
            const LayerIcon = cfg.icon;
            const count = memories.filter((m) => m.layer === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveLayer(activeLayer === key ? null : key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeLayer === key ? 'bg-glass text-white' : 'text-text-secondary hover:text-white hover:bg-glass/50'
                }`}
              >
                <LayerIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                <span className="flex-1 text-left">{cfg.label}</span>
                <span className="text-text-muted font-mono text-[10px]">{count}</span>
              </button>
            );
          })}

          {/* Layer legend */}
          <div className="mt-4 pt-3 border-t border-glass-border">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-2 px-1">
              Layer Info
            </div>
            {activeLayer && (
              <div className="px-2 py-2">
                <div className="text-xs font-medium mb-0.5" style={{ color: LAYER_CONFIG[activeLayer as keyof typeof LAYER_CONFIG].color }}>
                  {LAYER_CONFIG[activeLayer as keyof typeof LAYER_CONFIG].label}
                </div>
                <div className="text-[10px] text-text-muted leading-relaxed">
                  {LAYER_CONFIG[activeLayer as keyof typeof LAYER_CONFIG].desc}
                </div>
              </div>
            )}
          </div>
        </SpatialSidebar>

        {/* Right: Memory Cards */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search + filters */}
          <div className="px-4 py-3 border-b border-glass-border flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories, tags, content..."
                className="w-full bg-glass border border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-text-muted outline-none focus:border-agent-manager/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Filter className="w-3.5 h-3.5" />
              {filteredMemories.length} results
            </div>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-glass-border overflow-hidden"
              >
                <div className="px-4 py-3 flex gap-3">
                  <input
                    type="text"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
                    placeholder="Enter a fact to remember (e.g., 'I prefer dark mode for all apps')"
                    className="flex-1 bg-glass border border-glass-border rounded-lg px-4 py-2 text-sm text-white placeholder:text-text-muted outline-none focus:border-agent-manager/50"
                    autoFocus
                  />
                  <button
                    onClick={handleAddMemory}
                    disabled={!newFact.trim()}
                    className="px-4 py-2 rounded-lg bg-agent-manager text-white text-xs font-medium disabled:opacity-30"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memory list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <AnimatePresence>
              {filteredMemories.map((mem) => {
                const layerCfg = LAYER_CONFIG[mem.layer];
                const agent = mem.agentId ? DEFAULT_AGENTS.find((a: any) => a.id === mem.agentId) : null;
                return (
                  <motion.div
                    key={mem.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <GlassPanel className="p-4 group">
                      <div className="flex items-start gap-3">
                        {/* Layer indicator */}
                        <div
                          className="w-1 h-full rounded-full self-stretch shrink-0"
                          style={{ background: layerCfg.color, minHeight: 40 }}
                        />
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
                              style={{ background: `${layerCfg.color}15`, color: layerCfg.color }}
                            >
                              {layerCfg.label}
                            </span>
                            {agent && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-mono"
                                style={{ background: `${agent.color}15`, color: agent.color }}
                              >
                                {agent.name}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              mem.importance === 'high' ? 'bg-status-error/10 text-status-error' :
                              mem.importance === 'medium' ? 'bg-status-thinking/10 text-status-thinking' :
                              'bg-glass text-text-muted'
                            }`}>
                              {mem.importance}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono ml-auto">
                              {timeAgo(mem.timestamp)}
                            </span>
                          </div>

                          {/* Content */}
                          <p className="text-sm text-text-secondary leading-relaxed mb-2">
                            {mem.content}
                          </p>

                          {/* Tags */}
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-text-muted" />
                            {mem.tags.map((tag) => (
                              <span key={tag} className="text-[10px] text-text-muted font-mono bg-glass px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeMemory(mem.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </GlassPanel>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredMemories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40">
                <Brain className="w-8 h-8 text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted">No memories match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
