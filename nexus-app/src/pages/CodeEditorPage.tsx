import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Search, GitBranch, Bug, Blocks, Settings, User, FileCode2, Files, Folder, FolderOpen, ChevronRight, ChevronDown, X, Check, Terminal as TerminalIcon } from 'lucide-react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import AgentSidebar from '../components/ide/AgentSidebar';
import { useSettingsStore } from '../stores/settingsStore';
import { tauri } from '../services/tauri';
import PageTransition from '../components/layout/PageTransition';

// Types for Rust backend returns
interface RustFileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: RustFileNode[];
}

function FileTree({ nodes, depth = 0, onFileClick, activePath }: { nodes: RustFileNode[]; depth?: number; onFileClick: (path: string, name: string) => void; activePath: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div>
      {nodes.map((node) => (
        <div key={node.path}>
          <button
            onClick={() => {
              if (node.is_dir) {
                setExpanded((p) => ({ ...p, [node.path]: !p[node.path] }));
              } else {
                onFileClick(node.path, node.name);
              }
            }}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-left rounded text-xs transition-colors ${
              activePath === node.path ? 'bg-blue-500/10 text-blue-500 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {node.is_dir ? (
              <>
                {expanded[node.path] ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                {expanded[node.path] ? <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </>
            ) : (
              <>
                <span className="w-3" />
                <File className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {node.is_dir && expanded[node.path] && node.children && (
            <FileTree nodes={node.children} depth={depth + 1} onFileClick={onFileClick} activePath={activePath} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CodeEditorPage() {
  const navigate = useNavigate();
  const workspace = useSettingsStore((s) => s.workspace);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);
  const globalTheme = useSettingsStore((s) => s.theme);
  const workspacePath = workspace.workspacePath;
  
  // UI State
  const [activeActivity, setActiveActivity] = useState('explorer');

  // File System State
  const [fileTree, setFileTree] = useState<RustFileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<{ path: string; name: string; content: string; isDirty: boolean }[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['> NEXUS Native Code Editor Initialized.', '> Workspace: ' + (workspacePath || 'None')]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTerminalExpanding, setIsTerminalExpanding] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Agent / Diff State
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [modifiedCode, setModifiedCode] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Git State
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [gitCommitMessage, setGitCommitMessage] = useState('');
  const [isGitLoading, setIsGitLoading] = useState(false);

  const [isAgentWindowOpen, setIsAgentWindowOpen] = useState(true);

  const activeFile = openFiles.find(f => f.path === activeTabPath);

  // Load directory on mount
  useEffect(() => {
    if (!workspacePath) return;
    
    const loadTree = async () => {
      setIsLoadingTree(true);
      try {
        if (tauri.isTauri) {
          const tree = await tauri.listDirectory(workspacePath, 3); // Load 3 levels deep initially
          setFileTree(tree);
        } else {
           setTerminalOutput(prev => [...prev, '> Error: Not running in Tauri native environment. Cannot read filesystem.']);
        }
      } catch (e) {
        console.error("Failed to load directory", e);
        setTerminalOutput(prev => [...prev, `> Error loading directory: ${e}`]);
      } finally {
        setIsLoadingTree(false);
      }
    };
    
    loadTree();
  }, [workspacePath]);

  // Terminal auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleFileClick = async (path: string, name: string) => {
    if (openFiles.find(f => f.path === path)) {
      setActiveTabPath(path);
      return;
    }
    try {
      const content = await tauri.readFile(path);
      setOpenFiles(prev => [...prev, { path, name, content, isDirty: false }]);
      setActiveTabPath(path);
    } catch (e) {
      console.error(e);
      setTerminalOutput(prev => [...prev, `> Failed to open file: ${path}`]);
    }
  };

  const closeFile = (path: string) => {
    const newFiles = openFiles.filter(f => f.path !== path);
    setOpenFiles(newFiles);
    if (activeTabPath === path) {
      setActiveTabPath(newFiles.length > 0 ? newFiles[newFiles.length - 1].path : '');
      setIsDiffMode(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !activeTabPath) return;
    setOpenFiles(prev => prev.map(f => {
      if (f.path === activeTabPath) {
        return { ...f, content: value, isDirty: true };
      }
      return f;
    }));
  };

  const handleSave = async () => {
    if (!activeFile || !activeFile.isDirty) return;
    try {
      await tauri.writeFile(activeFile.path, activeFile.content);
      setOpenFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, isDirty: false } : f));
      setTerminalOutput(prev => [...prev, `> Saved: ${activeFile.name}`]);
    } catch (e) {
      console.error(e);
      setTerminalOutput(prev => [...prev, `> Error saving file: ${e}`]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return (
    ) => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const cmd = terminalInput;
    setTerminalInput('');
    setTerminalOutput(prev => [...prev, `> ${cmd}`]);

    try {
      const res = await tauri.executeCommand(cmd, workspacePath);
      if (res.stdout) setTerminalOutput(prev => [...prev, res.stdout]);
      if (res.stderr) setTerminalOutput(prev => [...prev, `<span class="text-red-400">${res.stderr}</span>`]);
      setTerminalOutput(prev => [...prev, `\n[Exited with code ${res.exit_code}]`]);
    } catch (error) {
       setTerminalOutput(prev => [...prev, `<span class="text-red-400">Execution Error: ${error}</span>`]);
    }
  };

  const handleSuggestDiff = (newCode: string) => {
    setModifiedCode(newCode);
    setIsDiffMode(true);
  };

  const handleAcceptDiff = () => {
    if (!activeFile) return;
    setOpenFiles(prev => prev.map(f => {
      if (f.path === activeFile.path) {
        return { ...f, content: modifiedCode, isDirty: true };
      }
      return f;
    }));
    setIsDiffMode(false);
  };

  const handleRejectDiff = () => {
    setIsDiffMode(false);
    setModifiedCode('');
  };

  useEffect(() => {
    if (activeActivity === 'git' && workspacePath) {
      fetchGitStatus();
    }
  }, [activeActivity, workspacePath]);

  const fetchGitStatus = async () => {
    if (!workspacePath) return;
    setIsGitLoading(true);
    try {
      const status = await tauri.gitStatus(workspacePath);
      setGitStatus(status);
    } catch (e) {
      console.error('Git status error:', e);
    } finally {
      setIsGitLoading(false);
    }
  };

  const handleGitCommit = async () => {
    if (!gitCommitMessage.trim() || !workspacePath) return;
    try {
      await tauri.gitCommit(workspacePath, gitCommitMessage);
      setGitCommitMessage('');
      fetchGitStatus();
      setTerminalOutput(prev => [...prev, '> Git Commit Successful']);
    } catch (e) {
      setTerminalOutput(prev => [...prev, `> Git Commit Error: ${e}`]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !workspacePath) return;
    setIsSearching(true);
    try {
      const results = await tauri.searchFiles(searchQuery, workspacePath);
      setSearchResults(results);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const gitChangesCount = gitStatus ? ((gitStatus.modified?.length || 0) + (gitStatus.untracked?.length || 0) + (gitStatus.staged?.length || 0)) : 0;

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
    <div className="h-full flex flex-col relative overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary)]">
      {/* VS Code Style Top Menu Bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)] sticky top-0 z-30 select-none ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[var(--bg-secondary)]'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-3 h-3 rounded-full bg-red-400 opacity-80 group-hover:opacity-100 flex items-center justify-center transition-all"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80 group-hover:opacity-100 flex items-center justify-center transition-all"></div>
             <div className="w-3 h-3 rounded-full bg-green-400 opacity-80 group-hover:opacity-100 flex items-center justify-center transition-all"></div>
          </div>
          
          <div className="flex items-center gap-1 text-[12px] text-[var(--text-secondary)] font-medium">
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">File</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Edit</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Selection</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">View</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Go</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Run</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Terminal</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Window</button>
            <button className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] px-2 py-0.5 rounded cursor-default transition-colors">Help</button>
          </div>
        </div>
        
        {/* Search / Path Bar in center */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-[var(--bg-void)] border border-[var(--border-color)] rounded-md px-3 py-0.5 shadow-sm text-xs text-[var(--text-secondary)] w-96 hover:bg-[var(--bg-glass-hover)] cursor-pointer transition-colors">
          <Search className="w-3 h-3 mr-2 text-[var(--text-muted)]" />
          <span className="truncate">{workspacePath ? `nexus-app — ${workspacePath.split('/').pop()}` : 'Search Workspace...'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout controls */}
          <div className="flex items-center bg-[var(--bg-void)] border border-[var(--border-color)] rounded overflow-hidden mr-2">
             <button className="p-1 hover:bg-[var(--bg-glass-hover)] text-[var(--text-secondary)] transition-colors" title="Toggle Primary Side Bar">
                <div className="w-3.5 h-3.5 border border-current rounded-sm flex"><div className="w-1/3 border-r border-current"></div></div>
             </button>
             <button className="p-1 hover:bg-[var(--bg-glass-hover)] text-[var(--text-secondary)] transition-colors border-l border-[var(--border-color)]" title="Toggle Secondary Side Bar" onClick={() => setIsAgentWindowOpen(!isAgentWindowOpen)}>
                <div className="w-3.5 h-3.5 border border-current rounded-sm flex justify-end"><div className="w-1/3 border-l border-current"></div></div>
             </button>
          </div>
          <button onClick={handleSave} className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${activeFile?.isDirty ? 'bg-blue-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]'}`}>
             <Check className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* VS Code Activity Bar (Far Left) */}
        <div className={`w-12 h-full flex flex-col items-center py-2 shrink-0 z-10 transition-colors duration-500 border-r border-[var(--border-color)] ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[var(--bg-secondary)]'}`}>
          <div className="flex flex-col gap-2 w-full items-center">
            <button 
              onClick={() => setActiveActivity('explorer')}
              className={`relative p-2.5 rounded flex items-center justify-center transition-colors ${activeActivity === 'explorer' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <Files className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {activeActivity === 'explorer' && <div className="absolute left-0 w-[2px] h-full bg-blue-500 rounded-r-sm" />}
            </button>
            <button 
              onClick={() => setActiveActivity('search')}
              className={`relative p-2.5 flex items-center justify-center transition-colors ${activeActivity === 'search' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <Search className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {activeActivity === 'search' && <div className="absolute left-0 w-[2px] h-full bg-blue-500 rounded-r-sm" />}
            </button>
            <button 
              onClick={() => setActiveActivity('git')}
              className={`relative p-2.5 flex items-center justify-center transition-colors ${activeActivity === 'git' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <GitBranch className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {activeActivity === 'git' && <div className="absolute left-0 w-[2px] h-full bg-blue-500 rounded-r-sm" />}
              {gitChangesCount > 0 && <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-[9px] font-bold px-1 min-w-[14px] text-center rounded-full z-10">{gitChangesCount}</div>}
            </button>
            <button 
              onClick={() => setActiveActivity('debug')}
              className={`relative p-2.5 flex items-center justify-center transition-colors ${activeActivity === 'debug' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <Bug className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {activeActivity === 'debug' && <div className="absolute left-0 w-[2px] h-full bg-blue-500 rounded-r-sm" />}
            </button>
            <button 
              onClick={() => setActiveActivity('extensions')}
              className={`relative p-2.5 flex items-center justify-center transition-colors ${activeActivity === 'extensions' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <Blocks className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {activeActivity === 'extensions' && <div className="absolute left-0 w-[2px] h-full bg-blue-500 rounded-r-sm" />}
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full items-center mt-auto pb-4">
            <button className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <User className="w-[24px] h-[24px]" strokeWidth={1.5} />
            </button>
            <button className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Settings className="w-[24px] h-[24px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Left Sidebar (File Explorer View) */}
        {activeActivity === 'explorer' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 border-r border-[var(--border-color)] ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[var(--bg-secondary)]'}`}>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">Explorer</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
            {isLoadingTree ? (
              <div className="text-xs text-[var(--text-muted)] px-4 py-2 animate-pulse">Loading directory...</div>
            ) : fileTree.length > 0 ? (
              <FileTree nodes={fileTree} onFileClick={handleFileClick} activePath={activeTabPath} />
            ) : (
              <div className="text-xs text-[var(--text-muted)] px-4 py-2 text-center mt-4">
                No files found or Workspace not set.<br />
                <span className="opacity-50 text-[10px]">Set workspace in command center</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Left Sidebar (Search View) */}
        {activeActivity === 'search' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 border-r border-[var(--border-color)] ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[var(--bg-secondary)]'}`}>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">Search</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workspace..."
                  className="w-full bg-[var(--bg-void)] text-[var(--text-primary)] border border-[var(--border-color)] px-2 py-1.5 rounded-sm text-xs outline-none focus:border-blue-500"
                />
              </form>
              <div className="flex flex-col gap-1">
                {isSearching ? (
                  <div className="text-xs text-[var(--text-muted)]">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleFileClick(res.path, res.path.split('/').pop() || 'Unknown')}
                      className="text-left py-1.5 px-2 hover:bg-[var(--bg-glass-hover)] rounded flex flex-col gap-0.5"
                    >
                      <span className="text-xs text-[var(--text-primary)] truncate font-mono">{res.line_content.trim()}</span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate">{res.path.split('/').pop()} : {res.line_number}</span>
                    </button>
                  ))
                ) : searchQuery && !isSearching ? (
                  <div className="text-xs text-[var(--text-muted)]">No results found.</div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Left Sidebar (Source Control View) */}
        {activeActivity === 'git' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 border-r border-[var(--border-color)] ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[var(--bg-secondary)]'}`}>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">Source Control</h2>
              {gitStatus && <span className="text-[10px] bg-[var(--bg-glass)] text-[var(--text-muted)] px-1.5 py-0.5 rounded font-mono">{gitStatus.branch}</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={gitCommitMessage}
                  onChange={(e) => setGitCommitMessage(e.target.value)}
                  placeholder="Message (Cmd+Enter to commit)"
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGitCommit(); }}
                  className="w-full bg-[var(--bg-void)] text-[var(--text-primary)] border border-[var(--border-color)] px-2 py-1.5 rounded-sm text-xs outline-none focus:border-blue-500"
                />
                <button onClick={handleGitCommit} className="w-full bg-blue-500 text-white text-xs py-1.5 rounded font-medium hover:bg-blue-600 transition-colors shadow-sm">
                  Commit
                </button>
              </div>
              
              {isGitLoading ? (
                <div className="text-xs text-[var(--text-muted)]">Loading git status...</div>
              ) : gitStatus ? (
                <div className="flex flex-col gap-3 mt-4">
                  {gitStatus.staged?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">Staged Changes</div>
                       {gitStatus.staged.map((f: string) => <div key={f} className="text-xs text-blue-500 truncate font-mono ml-2 py-0.5" title={f}>M {f.split('/').pop()}</div>)}
                     </div>
                  )}
                  {gitStatus.modified?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">Changes</div>
                       {gitStatus.modified.map((f: string) => <div key={f} className="text-xs text-[#d7ba7d] truncate font-mono ml-2 py-0.5" title={f}>M {f.split('/').pop()}</div>)}
                     </div>
                  )}
                  {gitStatus.untracked?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">Untracked</div>
                       {gitStatus.untracked.map((f: string) => <div key={f} className="text-xs text-emerald-500 truncate font-mono ml-2 py-0.5" title={f}>U {f.split('/').pop()}</div>)}
                     </div>
                  )}
                  {gitStatus.modified?.length === 0 && gitStatus.untracked?.length === 0 && gitStatus.staged?.length === 0 && (
                    <div className="text-xs text-[var(--text-muted)]">No pending changes.</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)]">Not a git repository.</div>
              )}
            </div>
          </div>
        )}

        {/* Center Content (Editor & Terminal) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[var(--bg-void)]">
          
          {/* File tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center border-b border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto no-scrollbar pt-1">
              <div className="flex items-center gap-px text-[12px]">
                {openFiles.map((tab) => (
                  <button
                    key={tab.path}
                    onClick={() => setActiveTabPath(tab.path)}
                    className={`px-3 py-1.5 flex items-center gap-2 border-r border-[var(--border-color)] transition-colors group ${
                      activeTabPath === tab.path ? 'bg-[var(--bg-void)] text-[var(--text-primary)] border-t border-t-blue-500' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)] border-t border-t-transparent'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className={tab.isDirty ? 'italic' : ''}>{tab.name}</span>
                    {tab.isDirty && <div className="w-2 h-2 rounded-full bg-[var(--text-primary)] ml-1 opacity-80" />}
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
                   <div className="flex items-center gap-1"><span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">⌘</span> + <span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">P</span> Go to File</div>
                   <div className="flex items-center gap-1"><span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">⌘</span> + <span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">Shift</span> + <span className="border border-[var(--border-color)] rounded px-1.5 py-0.5">F</span> Find in Files</div>
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
          
          {/* Embedded Native Terminal Dock */}
          <div className={`border-t border-[var(--border-color)] bg-[var(--bg-void)] transition-all duration-300 flex flex-col shrink-0 ${isTerminalExpanding ? 'h-64' : 'h-9'}`}>
             <div 
               className="flex items-center justify-between px-4 h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] cursor-pointer select-none"
               onClick={() => setIsTerminalExpanding(!isTerminalExpanding)}
             >
               <div className="flex items-center gap-2">
                 <TerminalIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                 <span className="text-[11px] font-medium tracking-wide text-[var(--text-secondary)] uppercase">Terminal</span>
               </div>
               <div className="flex gap-2 items-center">
                 <X className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={(e) => { e.stopPropagation(); setIsTerminalExpanding(false); }} />
                 {isTerminalExpanding ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
               </div>
             </div>
             
             {isTerminalExpanding && (
               <div className="flex-1 flex flex-col min-h-0 bg-void">
                 <div 
                   ref={terminalRef}
                   className="flex-1 overflow-y-auto px-4 py-3 text-[13px] font-mono leading-relaxed"
                 >
                   {terminalOutput.map((line, i) => (
                     <div key={i} className="whitespace-pre-wrap text-[#cecece] mb-1" dangerouslySetInnerHTML={{ __html: line }} />
                   ))}
                 </div>
                 <form onSubmit={handleTerminalSubmit} className="flex items-center px-4 py-1 pb-3 bg-void">
                   <span className="text-blue-400 font-mono text-[13px] mr-2">➜</span>
                   <span className="text-purple-400 font-mono text-[13px] mr-2">nexus</span>
                   <input 
                     type="text" 
                     value={terminalInput}
                     onChange={(e) => setTerminalInput(e.target.value)}
                     className="flex-1 bg-transparent outline-none text-[13px] font-mono text-white placeholder-white/20"
                     placeholder="bash..."
                     autoComplete="off"
                     spellCheck="false"
                   />
                 </form>
               </div>
             )}
          </div>

        </div>

        {/* Secondary Side Bar (Agent UI) */}
        {isAgentWindowOpen && (
          <AgentSidebar 
            onSuggestDiff={handleSuggestDiff}
            onClose={() => setIsAgentWindowOpen(false)}
            currentCode={activeFile ? activeFile.content : ''}
          />
        )}

      </div>
      
      {/* VS Code Footer Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-agent-coder text-white text-[10px] shrink-0 sticky bottom-0 z-40 select-none">
         <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors h-full">
             <GitBranch className="w-3 h-3" /> {gitStatus?.branch || 'main'}
           </div>
           <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors h-full">
             <X className="w-3 h-3" /> 0
             <Bug className="w-3 h-3 ml-1" /> 0
           </div>
         </div>
         <div className="flex items-center gap-3">
           <div className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors h-full flex items-center">{activeFile ? getLanguage(activeFile.name) : 'Plain Text'}</div>
           <div className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors h-full flex items-center">UTF-8</div>
           <div className="cursor-pointer hover:bg-white/20 px-1 rounded transition-colors h-full flex items-center">Nexus Agent: Active</div>
         </div>
      </div>
      
    </div>
    </PageTransition>
  );
}
