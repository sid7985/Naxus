import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, ChevronDown, ChevronRight
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import GlassInput from '../components/ui/GlassInput';
import PageTransition from '../components/layout/PageTransition';

interface SearchResult {
  file: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

interface GroupedResult {
  file: string;
  matches: SearchResult[];
  expanded: boolean;
}

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [fileFilter, setFileFilter] = useState('');

  // Demo search results for UI showcase
  const demoSearch = useCallback(() => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const demoResults: GroupedResult[] = [
        {
          file: 'src/services/orchestrator.ts',
          expanded: true,
          matches: [
            { file: 'src/services/orchestrator.ts', line: 56, content: `  async executeMission(userPrompt: string): Promise<void> {`, matchStart: 8, matchEnd: 22 },
            { file: 'src/services/orchestrator.ts', line: 387, content: `  async *chatWithAgent(agentRole: AgentRole, messages: ...) {`, matchStart: 10, matchEnd: 23 },
          ] },
        {
          file: 'src/stores/agentStore.ts',
          expanded: true,
          matches: [
            { file: 'src/stores/agentStore.ts', line: 33, content: `  updateAgentStatus: (agentId, status) =>`, matchStart: 2, matchEnd: 19 },
          ] },
        {
          file: 'src/pages/CommandCenterPage.tsx',
          expanded: false,
          matches: [
            { file: 'src/pages/CommandCenterPage.tsx', line: 184, content: `        {agents.map((agent, idx) => (`, matchStart: 9, matchEnd: 15 },
          ] },
      ];
      setResults(demoResults);
      setSearching(false);
    }, 600);
  }, [query]);

  const totalMatches = results.reduce((sum, g) => sum + g.matches.length, 0);

  const toggleGroup = (file: string) => {
    setResults((prev) =>
      prev.map((g) => (g.file === file ? { ...g, expanded: !g.expanded } : g))
    );
  };

  return (
    <PageTransition>
      <div className="h-full flex flex-col">
        <PageHeader
          title="Find in Files"
          subtitle="Search across your workspace"
          icon={Search}
          iconColor="#6366F1"
          badge={totalMatches > 0 ? `${totalMatches} results` : undefined}
        />

        {/* Search Controls */}
        <div className="px-5 py-3 space-y-3 border-b border-glass-border/30">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <GlassInput
                icon={<Search className="w-3.5 h-3.5" />}
                placeholder="Search across all files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && demoSearch()}
              />
            </div>
            <button
              onClick={demoSearch}
              className="px-4 py-2.5 bg-agent-researcher/20 text-agent-researcher rounded-xl text-xs font-medium hover:bg-agent-researcher/30 transition-colors border border-agent-researcher/20"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
                useRegex ? 'bg-agent-researcher/20 text-agent-researcher' : 'text-text-muted hover:text-white'
              }`}
            >
              .*
            </button>
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                caseSensitive ? 'bg-agent-researcher/20 text-agent-researcher' : 'text-text-muted hover:text-white'
              }`}
            >
              Aa
            </button>
            <div className="flex-1">
              <input
                className="glass-input text-[11px] py-1.5"
                placeholder="Filter by file type (e.g. *.tsx, *.ts)"
                value={fileFilter}
                onChange={(e) => setFileFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-5 h-5 border-2 border-agent-researcher/30 border-t-agent-researcher rounded-full" />
              <span className="ml-3 text-xs text-text-muted">Searching...</span>
            </div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Search className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {!searching && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Search className="w-10 h-10 mb-4 opacity-20" />
              <p className="text-sm font-medium">Search your workspace</p>
              <p className="text-xs mt-1">Type a query and press Enter or click Search</p>
              <div className="flex items-center gap-2 mt-4 text-[10px]">
                <kbd className="px-1.5 py-0.5 bg-glass rounded border border-glass-border">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-glass rounded border border-glass-border">⇧</kbd>
                <kbd className="px-1.5 py-0.5 bg-glass rounded border border-glass-border">F</kbd>
                <span className="text-text-muted ml-1">to open</span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {results.map((group, gIdx) => (
              <motion.div
                key={group.file}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gIdx * 0.05 }}
                className="border-b border-glass-border/20"
              >
                <button
                  onClick={() => toggleGroup(group.file)}
                  className="w-full flex items-center gap-2 px-5 py-2 hover:bg-glass/30 transition-colors text-left"
                >
                  {group.expanded ? (
                    <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  )}
                  <FileText className="w-3.5 h-3.5 text-agent-coder shrink-0" />
                  <span className="text-xs font-medium text-white truncate">{group.file}</span>
                  <span className="text-[10px] text-text-muted ml-auto shrink-0">
                    {group.matches.length} match{group.matches.length > 1 ? 'es' : ''}
                  </span>
                </button>

                <AnimatePresence>
                  {group.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {group.matches.map((match) => (
                        <div
                          key={`${match.file}:${match.line}`}
                          className="flex items-start gap-3 pl-10 pr-5 py-1.5 hover:bg-glass/20 cursor-pointer transition-colors"
                        >
                          <span className="text-[10px] text-text-muted font-mono w-8 text-right shrink-0 pt-0.5">
                            {match.line}
                          </span>
                          <pre className="text-[11px] font-mono text-text-secondary overflow-hidden whitespace-pre truncate">
                            {match.content}
                          </pre>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
