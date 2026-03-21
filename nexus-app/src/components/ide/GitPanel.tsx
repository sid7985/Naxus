import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { tauri } from '../../services/tauri';
import { Plus, RotateCw, Check } from 'lucide-react';

export default function GitPanel() {
  const workspacePath = useSettingsStore((s) => s.workspace.workspacePath);
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  const fetchStatus = async () => {
    if (!workspacePath || !tauri.isTauri) return;
    setIsLoading(true);
    try {
      const status = await tauri.gitStatus(workspacePath);
      setGitStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [workspacePath]);

  const handleCommit = async () => {
    if (!commitMessage.trim() || !workspacePath) return;
    try {
      await tauri.gitCommit(workspacePath, commitMessage);
      setCommitMessage('');
      fetchStatus();
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[var(--bg-glass)] flex flex-col gap-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Cmd+Enter to commit)"
          className="w-full bg-[var(--bg-glass)] border border-[var(--border-color)] rounded p-2 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-primary)] resize-none"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || isLoading}
            className="flex-1 bg-[var(--neon-primary)]/20 hover:bg-[var(--neon-primary)]/30 text-[var(--neon-primary)] disabled:opacity-50 border border-[var(--neon-primary)]/40 rounded py-1 flex items-center justify-center gap-1 text-[11px] font-medium transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Commit
          </button>
          <button 
            onClick={fetchStatus}
            className="p-1 rounded bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors text-[var(--text-muted)]"
            title="Refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {(!gitStatus || gitStatus.files.length === 0) ? (
          <div className="px-2 py-4 flex flex-col items-center gap-2 text-center mt-4">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-glass)] flex items-center justify-center">
              <Check className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div className="text-xs text-[var(--text-muted)] italic">
              No changes detected. Working tree is clean.
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-[var(--text-secondary)] px-2 uppercase tracking-wide mb-2">
              Changes
            </div>
            {gitStatus.files.map((file: any, i: number) => (
              <div key={i} className="group cursor-pointer flex items-center justify-between px-2 py-1 hover:bg-[var(--bg-glass-hover)] rounded">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    file.status === 'added' ? 'bg-green-500' :
                    file.status === 'modified' ? 'bg-blue-500' :
                    file.status === 'deleted' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-[11px] text-[var(--text-primary)] truncate">
                    {file.path.split('/').pop()}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-0.5 hover:bg-[var(--bg-glass)] rounded text-[var(--text-muted)]" title="Stage Change">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
