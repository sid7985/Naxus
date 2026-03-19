import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, GitCommit, Plus, Minus, FileText,
  Check, RefreshCw
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import NeonIcon from '../components/ui/NeonIcon';
import GlassInput from '../components/ui/GlassInput';
import PageTransition from '../components/layout/PageTransition';

interface FileChange {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  staged: boolean;
  additions: number;
  deletions: number;
}

const STATUS_COLORS = {
  modified: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'M' },
  added: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'A' },
  deleted: { text: 'text-red-400', bg: 'bg-red-500/10', label: 'D' },
  renamed: { text: 'text-blue-400', bg: 'bg-blue-500/10', label: 'R' } };

const DEMO_CHANGES: FileChange[] = [
  { file: 'src/services/orchestrator.ts', status: 'modified', staged: true, additions: 12, deletions: 3 },
  { file: 'src/stores/agentStore.ts', status: 'modified', staged: true, additions: 45, deletions: 15 },
  { file: 'src/components/ui/GlassInput.tsx', status: 'added', staged: false, additions: 52, deletions: 0 },
  { file: 'src/components/ui/GlassModal.tsx', status: 'added', staged: false, additions: 78, deletions: 0 },
  { file: 'src/services/eventBus.ts', status: 'added', staged: false, additions: 48, deletions: 0 },
  { file: 'src/styles/globals.css', status: 'modified', staged: false, additions: 37, deletions: 0 },
  { file: 'src/pages/OldPage.tsx', status: 'deleted', staged: false, additions: 0, deletions: 120 },
];

const DEMO_LOG = [
  { hash: 'a3f7c9d', message: 'feat: add glassmorphism design system', author: 'nexus', time: '2h ago', branch: 'main' },
  { hash: 'b1e2f4a', message: 'refactor: extract PageHeader component', author: 'nexus', time: '4h ago', branch: 'main' },
  { hash: 'c5d8e1b', message: 'fix: agent status persistence', author: 'nexus', time: '1d ago', branch: 'main' },
  { hash: 'd9f0a2c', message: 'feat: integrate NeonIcon across pages', author: 'nexus', time: '1d ago', branch: 'main' },
  { hash: 'e3g4h5i', message: 'chore: cleanup unused imports', author: 'nexus', time: '2d ago', branch: 'main' },
];

export default function GitPanelPage() {
  const [changes, setChanges] = useState(DEMO_CHANGES);
  const [commitMsg, setCommitMsg] = useState('');
  const [activeView, setActiveView] = useState<'changes' | 'log'>('changes');

  const staged = changes.filter((c) => c.staged);
  const unstaged = changes.filter((c) => !c.staged);
  const totalAdditions = changes.reduce((s, c) => s + c.additions, 0);
  const totalDeletions = changes.reduce((s, c) => s + c.deletions, 0);

  const toggleStage = (file: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.file === file ? { ...c, staged: !c.staged } : c))
    );
  };

  const stageAll = () => setChanges((prev) => prev.map((c) => ({ ...c, staged: true })));

  return (
    <PageTransition>
      <div className="h-full flex flex-col">
        <PageHeader
          title="Source Control"
          subtitle="Git operations & version history"
          icon={GitBranch}
          iconColor="#F59E0B"
          badge={`${changes.length} changes`}
          actions={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                <GitBranch className="w-3 h-3" /> main
              </span>
              <button className="p-1.5 rounded-lg hover:bg-glass transition-colors" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          }
        />

        {/* View Toggle */}
        <div className="flex items-center gap-2 px-5 py-2.5">
          <div className="tab-pills">
            <button onClick={() => setActiveView('changes')} className={`tab-pill ${activeView === 'changes' ? 'active' : ''}`}>
              Changes ({changes.length})
            </button>
            <button onClick={() => setActiveView('log')} className={`tab-pill ${activeView === 'log' ? 'active' : ''}`}>
              History
            </button>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px]">
            <span className="text-emerald-400">+{totalAdditions}</span>
            <span className="text-red-400">-{totalDeletions}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeView === 'changes' ? (
            <div className="p-5 space-y-4">
              {/* Commit Box */}
              <GlassPanel elevated className="p-4 space-y-3">
                <GlassInput
                  placeholder="Commit message..."
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  icon={<GitCommit className="w-3.5 h-3.5" />}
                />
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-agent-marketer/20 text-agent-marketer text-xs font-medium hover:bg-agent-marketer/30 transition-colors border border-agent-marketer/20 disabled:opacity-40"
                    disabled={!commitMsg.trim() || staged.length === 0}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Commit ({staged.length} staged)
                  </button>
                  <button
                    onClick={stageAll}
                    className="px-3 py-2 rounded-xl text-xs text-text-muted hover:text-white hover:bg-glass transition-colors"
                  >
                    Stage All
                  </button>
                </div>
              </GlassPanel>

              {/* Staged Changes */}
              {staged.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                    Staged Changes ({staged.length})
                  </h3>
                  <div className="space-y-1">
                    {staged.map((change, idx) => (
                      <FileChangeRow key={change.file} change={change} onToggle={toggleStage} idx={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Unstaged Changes */}
              {unstaged.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                    Changes ({unstaged.length})
                  </h3>
                  <div className="space-y-1">
                    {unstaged.map((change, idx) => (
                      <FileChangeRow key={change.file} change={change} onToggle={toggleStage} idx={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 space-y-2">
              {DEMO_LOG.map((commit, idx) => (
                <motion.div
                  key={commit.hash}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassPanel hover className="p-3 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <NeonIcon icon={GitCommit} color="#F59E0B" size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{commit.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-agent-designer">{commit.hash}</span>
                          <span className="text-[10px] text-text-muted">{commit.author}</span>
                          <span className="text-[10px] text-text-muted">{commit.time}</span>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function FileChangeRow({
  change, onToggle, idx }: { change: FileChange; onToggle: (file: string) => void; idx: number }) {
  const sc = STATUS_COLORS[change.status];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
    >
      <GlassPanel hover className="p-2.5 flex items-center gap-3 cursor-pointer group" onClick={() => onToggle(change.file)}>
        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${sc.bg} ${sc.text}`}>
          {sc.label}
        </span>
        <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span className="text-xs text-white truncate flex-1">{change.file}</span>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {change.additions > 0 && <span className="text-emerald-400">+{change.additions}</span>}
          {change.deletions > 0 && <span className="text-red-400">-{change.deletions}</span>}
        </div>
        <button
          className="p-1 rounded-md hover:bg-glass opacity-0 group-hover:opacity-100 transition-all"
          title={change.staged ? 'Unstage' : 'Stage'}
        >
          {change.staged ? <Minus className="w-3 h-3 text-text-muted" /> : <Plus className="w-3 h-3 text-text-muted" />}
        </button>
      </GlassPanel>
    </motion.div>
  );
}
