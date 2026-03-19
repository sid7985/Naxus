import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Keyboard, Search} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import GlassInput from '../components/ui/GlassInput';
import PageTransition from '../components/layout/PageTransition';

interface Shortcut {
  id: string;
  keys: string[];
  action: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { id: 's1', keys: ['⌘', 'K'], action: 'Open Command Palette', category: 'General' },
  { id: 's2', keys: ['⌘', ','], action: 'Open Settings', category: 'General' },
  { id: 's3', keys: ['⌘', '1'], action: 'Go to Command Center', category: 'Navigation' },
  { id: 's4', keys: ['⌘', '2'], action: 'Go to Code Editor', category: 'Navigation' },
  { id: 's5', keys: ['⌘', '3'], action: 'Go to Memory', category: 'Navigation' },
  { id: 's6', keys: ['⌘', '4'], action: 'Go to Observability', category: 'Navigation' },
  { id: 's7', keys: ['⌘', 'G'], action: 'Toggle RPG World', category: 'Navigation' },
  { id: 's8', keys: ['⌘', '⇧', 'F'], action: 'Find in Files', category: 'Search' },
  { id: 's9', keys: ['⌘', 'S'], action: 'Save Current File', category: 'Editor' },
  { id: 's10', keys: ['⌘', 'P'], action: 'Quick Open File', category: 'Editor' },
  { id: 's11', keys: ['⌘', 'Z'], action: 'Undo', category: 'Editor' },
  { id: 's12', keys: ['⌘', '⇧', 'Z'], action: 'Redo', category: 'Editor' },
  { id: 's13', keys: ['⌘', '/'], action: 'Toggle Comment', category: 'Editor' },
  { id: 's14', keys: ['⌘', 'D'], action: 'Select Next Match', category: 'Editor' },
  { id: 's15', keys: ['Esc'], action: 'Close Palette / Modal', category: 'General' },
  { id: 's16', keys: ['⌘', 'B'], action: 'Toggle Sidebar', category: 'UI' },
  { id: 's17', keys: ['⌘', 'J'], action: 'Toggle Terminal', category: 'UI' },
  { id: 's18', keys: ['⌘', '⇧', 'E'], action: 'Focus Explorer', category: 'UI' },
];

export default function KeyboardShortcutsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(SHORTCUTS.map((s) => s.category)))];

  const filtered = SHORTCUTS.filter((s) => {
    const matchesSearch = !search || s.action.toLowerCase().includes(search.toLowerCase()) || s.keys.join('').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedByCategory = filtered.reduce<Record<string, Shortcut[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <PageTransition>
      <div className="h-full flex flex-col">
        <PageHeader
          title="Keyboard Shortcuts"
          subtitle="View and customize shortcuts"
          icon={Keyboard}
          iconColor="#F59E0B"
          badge={`${SHORTCUTS.length} shortcuts`}
        />

        <div className="flex items-center gap-3 px-5 py-3">
          <div className="flex-1 max-w-md">
            <GlassInput
              icon={<Search className="w-3.5 h-3.5" />}
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tab-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tab-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {Object.entries(groupedByCategory).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
                {category}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((shortcut, idx) => (
                  <motion.div
                    key={shortcut.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <GlassPanel hover className="px-4 py-2.5 flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-white">{shortcut.action}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="min-w-[24px] h-6 flex items-center justify-center px-1.5 bg-void rounded-md border border-glass-border text-[10px] font-mono text-text-secondary"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
