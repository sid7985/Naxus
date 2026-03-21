import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Search as SearchIcon, File, X } from 'lucide-react';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const isSetupComplete = useSettingsStore(s => s.workspace.isSetupComplete);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    // Mock search for now since we don't have the rust exact string search yet
    setResults([
      { file: 'src/App.tsx', line: 42, match: `function AppShell({ children }: { children: React.ReactNode }) {` }
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--bg-glass)]">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace..."
            className="w-full bg-[var(--bg-glass)] border border-[var(--border-color)] rounded py-1 pl-8 pr-8 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-primary)]"
            disabled={!isSetupComplete}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-[var(--bg-glass-hover)]"
            >
              <X className="w-3 h-3 text-[var(--text-muted)]" />
            </button>
          )}
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-2 py-4 text-xs text-[var(--text-muted)] italic text-center">
            {query.trim() ? 'No results found.' : 'Enter a search term.'}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] font-medium text-[var(--text-secondary)] px-2 uppercase tracking-wide">
              Results found
            </div>
            {results.map((r, i) => (
              <div key={i} className="group cursor-pointer rounded overflow-hidden">
                <div className="px-2 py-1 bg-[var(--bg-glass)] flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-primary)] group-hover:bg-[var(--neon-primary)]/10">
                  <File className="w-3.5 h-3.5 text-[var(--neon-secondary)]" />
                  {r.file}
                </div>
                <div className="px-2 py-1.5 bg-[var(--bg-void)] font-mono text-[10px] text-[var(--text-muted)] truncate group-hover:text-[var(--text-secondary)]">
                  <span className="text-[9px] opacity-50 mr-2 border-r border-[var(--border-color)] pr-2">{r.line}</span>
                  {r.match}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
