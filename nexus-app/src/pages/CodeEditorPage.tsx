import { useState, useEffect } from 'react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import { FileCode2, X, Check } from 'lucide-react';
import AgentSidebar from '../components/ide/AgentSidebar';
import { useSettingsStore } from '../stores/settingsStore';
import { useEditorStore } from '../stores/editorStore';
import { tauri } from '../services/tauri';
import PageTransition from '../components/layout/PageTransition';

export default function CodeEditorPage() {
  const globalTheme = useSettingsStore((s) => s.theme);
  
  // Connect to Global Editor Store
  const { openFiles, activeTabPath, setActiveTab, closeFile, updateFileContent, markFileSaved } = useEditorStore();
  const activeFile = openFiles.find(f => f.path === activeTabPath);

  // Agent / Diff State (Local to Editor Area)
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [modifiedCode, setModifiedCode] = useState('');
  const [isAgentWindowOpen, setIsAgentWindowOpen] = useState(false);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && activeTabPath) {
      updateFileContent(activeTabPath, value);
    }
  };

  const handleSave = async () => {
    if (!activeFile || !activeFile.isDirty) return;
    try {
      if (tauri.isTauri) {
        await tauri.writeFile(activeFile.path, activeFile.content);
        markFileSaved(activeFile.path);
      } else {
        markFileSaved(activeFile.path);
        console.log('Saved (Mock Web Mode):', activeFile.path);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsAgentWindowOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  const handleSuggestDiff = (newCode: string) => {
    setModifiedCode(newCode);
    setIsDiffMode(true);
  };

  const handleAcceptDiff = () => {
    if (!activeFile) return;
    updateFileContent(activeFile.path, modifiedCode);
    setIsDiffMode(false);
  };

  const handleRejectDiff = () => {
    setIsDiffMode(false);
    setModifiedCode('');
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.rs')) return 'rust';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  return (
    <PageTransition>
      <div className="h-full flex relative overflow-hidden bg-[var(--bg-void)]">
        
        {/* Editor Area (Tabs + Monaco) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* File tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center border-b border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto no-scrollbar pt-1 shrink-0">
              <div className="flex items-center gap-px text-[12px]">
                {openFiles.map((tab) => (
                  <button
                    key={tab.path}
                    onClick={() => setActiveTab(tab.path)}
                    className={`px-3 py-1.5 flex items-center gap-2 border-r border-[var(--border-color)] transition-colors group select-none ${
                      activeTabPath === tab.path ? 'bg-[var(--bg-void)] text-[var(--text-primary)] border-t border-t-blue-500' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)] border-t border-t-transparent'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className={tab.isDirty ? 'italic' : ''}>{tab.name}</span>
                    {tab.isDirty && <div className="w-2 h-2 rounded-full bg-[var(--text-primary)] ml-1" />}
                    
                    <div 
                      className={`p-0.5 rounded ml-1 transition-opacity ${activeTabPath === tab.path ? 'opacity-100 hover:bg-[var(--bg-glass-hover)]' : 'opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-glass-hover)]'}`}
                      onClick={(e) => { e.stopPropagation(); closeFile(tab.path); }} 
                    >
                      <X className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Diffs Bar if an agent proposed code */}
          {isDiffMode && activeFile && (
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50/10 border-b border-blue-500/30 shrink-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 <span className="text-xs font-medium text-blue-500">NEXUS Agent proposes changes to {activeFile.name}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAcceptDiff} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-all shadow-sm">
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={handleRejectDiff} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-void)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded hover:bg-[var(--bg-glass-hover)] transition-all">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Monaco Code display */}
          <div className="flex-1 w-full relative">
            {!activeFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <img src="/logo.svg" alt="Nexus" className="w-24 h-24 mb-6 grayscale opacity-20" />
                <div className="flex gap-4 opacity-50 text-[11px] font-mono tracking-wider items-center text-[var(--text-secondary)]">
                   <div className="flex flex-col items-center gap-2">
                     <div className="flex items-center gap-1">
                       <span className="text-[var(--text-muted)]">Select a file from the Explorer Sidebar to begin editing.</span>
                     </div>
                     <div className="flex items-center gap-2 mt-4">
                       <span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">⌘</span>
                       <span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">B</span>
                       <span>Toggle Agent Console</span>
                     </div>
                   </div>
                </div>
              </div>
            ) : isDiffMode ? (
              <DiffEditor
                height="100%"
                language={getLanguage(activeFile.name)}
                theme={globalTheme === 'light' ? 'vs' : 'vs-dark'}
                original={activeFile.content}
                modified={modifiedCode}
                options={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  minimap: { enabled: false },
                  renderSideBySide: true,
                  readOnly: true,
                  lineNumbersMinChars: 4,
                  scrollBeyondLastLine: false,
                  padding: { top: 16 }
                }}
              />
            ) : (
              <Editor
                height="100%"
                language={getLanguage(activeFile.name)}
                theme={globalTheme === 'light' ? 'vs' : 'vs-dark'}
                value={activeFile.content}
                onChange={handleCodeChange}
                options={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on'
                }}
              />
            )}
          </div>
        </div>

        {/* Secondary Side Bar (Agent UI) */}
        {isAgentWindowOpen && (
          <div className="w-80 shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col h-full">
            <AgentSidebar 
              onSuggestDiff={handleSuggestDiff}
              onClose={() => setIsAgentWindowOpen(false)}
              currentCode={activeFile ? activeFile.content : ''}
            />
          </div>
        )}

      </div>
    </PageTransition>
  );
}
