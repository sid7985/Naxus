// ===== NEXUS Command Palette =====
// Global ⌘K command palette with fuzzy search, similar to Raycast/VS Code

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, Crown, Code2, Palette, Megaphone,
  Bug, Settings, Activity, Brain, Monitor, FolderOpen,
  Plus, UserPlus, Sparkles, Mic, ShieldCheck
} from 'lucide-react';

interface PaletteAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  color?: string;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: PaletteAction[] = [
    { id: 'home', label: 'Command Center', description: 'Main workspace', icon: Crown, color: '#7C3AED', shortcut: '⌘1', action: () => navigate('/') },
    { id: 'editor', label: 'Code Editor', description: 'IDE with AI assistant', icon: Code2, color: '#06B6D4', shortcut: '⌘2', action: () => navigate('/editor') },
    { id: 'mission', label: 'New Mission', description: 'Create a multi-agent mission', icon: Plus, color: '#7C3AED', shortcut: '⌘N', action: () => navigate('/mission/new') },
    { id: 'computer', label: 'Computer Mode', description: 'Async autonomous missions', icon: Monitor, color: '#06B6D4', action: () => navigate('/computer') },
    { id: 'memory', label: 'Memory & Knowledge', description: '5-layer memory system', icon: Brain, color: '#F59E0B', action: () => navigate('/memory') },
    { id: 'obs', label: 'Observability', description: 'Metrics & agent performance', icon: Activity, color: '#10B981', action: () => navigate('/observability') },
    { id: 'projects', label: 'Project Manager', description: 'Manage workspaces', icon: FolderOpen, color: '#10B981', action: () => navigate('/projects') },
    { id: 'create-agent', label: 'Create Agent', description: 'Build a custom agent', icon: UserPlus, color: '#F59E0B', action: () => navigate('/agent/create') },
    { id: 'settings', label: 'Settings', description: 'Models, appearance, privacy', icon: Settings, color: '#A0A0B0', shortcut: '⌘,', action: () => navigate('/settings') },
    { id: 'voice', label: 'Voice Control', description: 'Speak natively to NEXUS', icon: Mic, color: '#818CF8', shortcut: '⌘⇧V', action: () => navigate('/voice') },
    { id: 'internet', label: 'Web Capabilities', description: 'Network mode and proxy', icon: ShieldCheck, color: '#10B981', action: () => navigate('/internet') },
    // Agent shortcuts
    { id: 'agent-manager', label: 'Chat with Manager', icon: Crown, color: '#7C3AED', action: () => navigate('/agent/agent-manager') },
    { id: 'agent-coder', label: 'Chat with Coder', icon: Code2, color: '#06B6D4', action: () => navigate('/agent/agent-coder') },
    { id: 'agent-designer', label: 'Chat with Designer', icon: Palette, color: '#F59E0B', action: () => navigate('/agent/agent-designer') },
    { id: 'agent-marketer', label: 'Chat with Marketer', icon: Megaphone, color: '#10B981', action: () => navigate('/agent/agent-marketer') },
    { id: 'agent-tester', label: 'Chat with Tester', icon: Bug, color: '#F43F5E', action: () => navigate('/agent/agent-tester') },
  ];

  const filteredActions = query
    ? actions.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description?.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  // Keyboard shortcut: ⌘K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyNav = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
        setIsOpen(false);
      }
    }
  }, [filteredActions, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[560px] max-h-[60vh] z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 25, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-glass-border">
              <Search className="w-5 h-5 text-agent-manager shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNav}
                placeholder="Search commands, agents, pages..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-text-muted outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-glass text-[10px] font-mono text-text-muted">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[45vh] overflow-y-auto py-1">
              {filteredActions.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-text-muted">
                  No results for "{query}"
                </div>
              )}
              {filteredActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => { action.action(); setIsOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex ? 'bg-glass' : 'hover:bg-glass/50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${action.color || '#666'}10` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: action.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{action.label}</div>
                      {action.description && (
                        <div className="text-[11px] text-text-muted truncate">{action.description}</div>
                      )}
                    </div>
                    {action.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-glass text-[10px] font-mono text-text-muted shrink-0">
                        {action.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>⎋ Close</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-text-muted">
                <Sparkles className="w-3 h-3 text-agent-manager" />
                NEXUS Command Palette
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
