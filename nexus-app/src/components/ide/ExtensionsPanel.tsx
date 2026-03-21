import { Puzzle } from 'lucide-react';

const MOCK_EXTENSIONS = [
  { id: '1', name: 'Claude Code Agent', version: '1.2.0', status: 'installed', publisher: 'Anthropic' },
  { id: '2', name: 'NEXUS Workflow Snippets', version: '0.9.5', status: 'installed', publisher: 'NEXUS Core' },
  { id: '3', name: 'React Native Tools', version: '2.5.1', status: 'available', publisher: 'Meta' },
];

export default function ExtensionsPanel() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-void)]">
      <div className="p-3 border-b border-[var(--bg-glass)]">
        <input
          type="text"
          placeholder="Search Extensions in Marketplace..."
          className="w-full bg-[var(--bg-glass)] border border-[var(--border-color)] rounded py-1 px-3 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-primary)]"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          <div className="text-[10px] font-medium text-[var(--text-secondary)] px-2 uppercase tracking-wide mb-2 flex justify-between">
            <span>Installed</span>
            <span className="bg-[var(--bg-glass)] px-1.5 py-0.5 rounded">2</span>
          </div>
          <div className="space-y-1">
            {MOCK_EXTENSIONS.filter(e => e.status === 'installed').map((ext) => (
              <div key={ext.id} className="cursor-pointer flex flex-col p-2 hover:bg-[var(--bg-glass-hover)] rounded border border-transparent hover:border-[var(--border-color)] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[var(--bg-glass)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                    <Puzzle className="w-3.5 h-3.5 text-[var(--neon-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[var(--text-primary)] truncate">{ext.name}</div>
                    <div className="text-[9px] text-[var(--text-muted)]">{ext.publisher}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium text-[var(--text-secondary)] px-2 uppercase tracking-wide mb-2 flex justify-between">
            <span>Recommended</span>
          </div>
          <div className="space-y-1">
            {MOCK_EXTENSIONS.filter(e => e.status === 'available').map((ext) => (
              <div key={ext.id} className="cursor-pointer flex flex-col p-2 hover:bg-[var(--bg-glass-hover)] rounded border border-transparent hover:border-[var(--border-color)] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[var(--bg-glass)] flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                    <Puzzle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-[var(--text-primary)] truncate">{ext.name}</div>
                    <div className="text-[9px] text-[var(--text-muted)]">{ext.publisher}</div>
                  </div>
                </div>
                <div className="mt-2 flex">
                  <button className="bg-[var(--bg-glass)] hover:bg-[var(--neon-primary)] hover:text-[#000] text-[var(--text-secondary)] rounded pt-0.5 pb-[3px] px-2 text-[10px] font-medium transition-colors">
                    Install
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
