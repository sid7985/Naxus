import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, File, Search, GitBranch, Bug, Blocks, FlaskConical, Settings, User, FileCode2, Files, Folder, FolderOpen, ChevronRight, ChevronDown, X, Check, Terminal as TerminalIcon, Play } from 'lucide-react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import FloatingAgentWindow from '../components/ide/FloatingAgentWindow';
import ModelSelector from '../components/ui/ModelSelector';
import { useSettingsStore } from '../stores/settingsStore';
import { tauri } from '../services/tauri';

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
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-left hover:bg-glass rounded text-xs transition-colors ${
              activePath === node.path ? 'bg-agent-manager/10 text-white' : 'text-text-secondary'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {node.is_dir ? (
              <>
                {expanded[node.path] ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                {expanded[node.path] ? <FolderOpen className="w-3.5 h-3.5 text-agent-designer shrink-0" /> : <Folder className="w-3.5 h-3.5 text-agent-designer shrink-0" />}
              </>
            ) : (
              <>
                <span className="w-3" />
                <File className="w-3.5 h-3.5 text-agent-coder shrink-0" />
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
    // Check if already open
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

  // Keyboard shortcut listener for IDE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  // Derived Git Badge
  const gitChangesCount = gitStatus ? ((gitStatus.modified?.length || 0) + (gitStatus.untracked?.length || 0) + (gitStatus.staged?.length || 0)) : 0;

  // Infer language from filename
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
    <div className="h-full flex flex-col relative overflow-hidden bg-[#0e0e0e]">
      {/* VS Code Style Top Menu Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#181818] border-b border-[#2d2d2d] sticky top-0 z-30 select-none">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-[#2d2d2d] rounded text-text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-3 text-[11px] text-[#cccccc]">
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">File</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Edit</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Selection</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">View</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Go</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Run</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Terminal</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Window</button>
            <button className="hover:text-white hover:bg-[#2d2d2d] px-1.5 py-0.5 rounded cursor-default">Help</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {workspacePath && <span className="text-[10px] bg-[#2d2d2d] text-[#999] px-2 py-0.5 rounded-full">{workspacePath.split('/').pop()}</span>}
          <ModelSelector />
          <button onClick={handleSave} className={`p-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${activeFile?.isDirty ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'text-text-muted hover:text-white hover:bg-glass'}`}>
             <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* VS Code Activity Bar (Far Left) */}
        <div className={`w-14 h-full flex flex-col items-center py-4 shrink-0 z-10 transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-r border-white/10' : 'bg-[#333333]'}`}>
          <div className="flex flex-col gap-4 w-full items-center">
            <button 
              onClick={() => setActiveActivity('explorer')}
              className={`relative p-2 rounded-lg flex items-center justify-center transition-colors ${activeActivity === 'explorer' ? 'text-white' : 'text-[#858585] hover:text-white'}`}
            >
              <Files className="w-[22px] h-[22px]" strokeWidth={1.5} />
              {activeActivity === 'explorer' && <div className="absolute left-0 w-[2px] h-full bg-[#007acc]" />}
            </button>
            <button 
              onClick={() => setActiveActivity('search')}
              className={`relative p-2 flex items-center justify-center transition-colors ${activeActivity === 'search' ? 'text-white' : 'text-[#858585] hover:text-white'}`}
            >
              <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setActiveActivity('git')}
              className={`relative p-2 flex items-center justify-center transition-colors ${activeActivity === 'git' ? 'text-white' : 'text-[#858585] hover:text-white'}`}
            >
              <GitBranch className="w-[22px] h-[22px]" strokeWidth={1.5} />
              {gitChangesCount > 0 && <div className="absolute top-0 right-0 bg-[#007acc] text-white text-[9px] font-bold px-1 py-[1px] min-w-[14px] text-center rounded-full z-10 translate-x-1 -translate-y-1">{gitChangesCount}</div>}
            </button>
            <button 
              onClick={() => setActiveActivity('debug')}
              className={`relative p-2 flex items-center justify-center transition-colors ${activeActivity === 'debug' ? 'text-white' : 'text-[#858585] hover:text-white'}`}
            >
              <Bug className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setActiveActivity('extensions')}
              className={`relative p-2 flex items-center justify-center transition-colors ${activeActivity === 'extensions' ? 'text-white' : 'text-[#858585] hover:text-white'}`}
            >
              <Blocks className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <button 
              className={`relative p-2 flex items-center justify-center transition-colors text-[#858585] hover:text-white`}
            >
              <FlaskConical className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full items-center">
            <button className="p-2 text-[#858585] hover:text-white transition-colors">
              <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-[#858585] hover:text-white transition-colors">
              <Settings className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Left Sidebar (File Explorer View) */}
        {activeActivity === 'explorer' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-r border-white/10' : 'bg-[#1e1e1e] border-r border-[#2d2d2d]'}`}>
            <div className={`px-5 py-3 flex items-center justify-between transition-colors duration-500 ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[#1e1e1e]'}`}>
              <h2 className="text-[10px] font-mono font-semibold tracking-widest text-[#cccccc] uppercase">Explorer</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
            {isLoadingTree ? (
              <div className="text-xs text-text-muted px-4 py-2 animate-pulse">Loading directory...</div>
            ) : fileTree.length > 0 ? (
              <FileTree nodes={fileTree} onFileClick={handleFileClick} activePath={activeTabPath} />
            ) : (
              <div className="text-xs text-text-muted px-4 py-2 text-center mt-4">
                No files found or Workspace not set.<br />
                <span className="opacity-50 text-[10px]">Set workspace in command center</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Left Sidebar (Search View) */}
        {activeActivity === 'search' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-r border-white/10' : 'bg-[#1e1e1e] border-r border-[#2d2d2d]'}`}>
            <div className={`px-5 py-3 flex items-center justify-between transition-colors duration-500 ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[#1e1e1e]'}`}>
              <h2 className="text-[10px] font-mono font-semibold tracking-widest text-[#cccccc] uppercase">Search</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workspace..."
                  className="w-full bg-[#3c3c3c] text-[#cccccc] px-2 py-1 text-xs outline-none border border-transparent focus:border-[#007acc]"
                />
              </form>
              <div className="flex flex-col gap-1">
                {isSearching ? (
                  <div className="text-xs text-[#858585]">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleFileClick(res.path, res.path.split('/').pop() || 'Unknown')}
                      className="text-left py-1 px-2 hover:bg-[#2d2d2d] rounded flex flex-col gap-0.5"
                    >
                      <span className="text-xs text-[#cccccc] truncate font-mono">{res.line_content.trim()}</span>
                      <span className="text-[10px] text-[#858585] truncate">{res.path.split('/').pop()} : {res.line_number}</span>
                    </button>
                  ))
                ) : searchQuery && !isSearching ? (
                  <div className="text-xs text-[#858585]">No results found.</div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Left Sidebar (Source Control View) */}
        {activeActivity === 'git' && (
          <div className={`w-64 flex flex-col overflow-hidden shrink-0 hidden md:flex transition-colors duration-500 ${liquidGlassEnabled ? 'bg-black/30 backdrop-blur-3xl border-r border-white/10' : 'bg-[#1e1e1e] border-r border-[#2d2d2d]'}`}>
            <div className={`px-5 py-3 flex items-center justify-between transition-colors duration-500 ${liquidGlassEnabled ? 'bg-transparent' : 'bg-[#1e1e1e]'}`}>
              <h2 className="text-[10px] font-mono font-semibold tracking-widest text-[#cccccc] uppercase">Source Control</h2>
              {gitStatus && <span className="text-[10px] text-[#858585] font-mono">{gitStatus.branch}</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={gitCommitMessage}
                  onChange={(e) => setGitCommitMessage(e.target.value)}
                  placeholder="Message (Cmd+Enter to commit)"
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGitCommit(); }}
                  className="w-full bg-[#3c3c3c] text-[#cccccc] px-2 py-1 text-xs outline-none border border-transparent focus:border-[#007acc]"
                />
                <button onClick={handleGitCommit} className="w-full bg-[#007acc] text-white text-xs py-1 rounded hover:bg-[#005f9e]">
                  Commit
                </button>
              </div>
              
              {isGitLoading ? (
                <div className="text-xs text-[#858585]">Loading git status...</div>
              ) : gitStatus ? (
                <div className="flex flex-col gap-3">
                  {gitStatus.staged?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[#cccccc] font-semibold mb-1 uppercase">Staged Changes</div>
                       {gitStatus.staged.map((f: string) => <div key={f} className="text-xs text-[#858585] truncate font-mono ml-2 text-indigo-400">M {f}</div>)}
                     </div>
                  )}
                  {gitStatus.modified?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[#cccccc] font-semibold mb-1 uppercase">Changes</div>
                       {gitStatus.modified.map((f: string) => <div key={f} className="text-xs text-[#858585] truncate font-mono ml-2 text-yellow-500">M {f}</div>)}
                     </div>
                  )}
                  {gitStatus.untracked?.length > 0 && (
                     <div>
                       <div className="text-[10px] text-[#cccccc] font-semibold mb-1 uppercase">Untracked</div>
                       {gitStatus.untracked.map((f: string) => <div key={f} className="text-xs text-[#858585] truncate font-mono ml-2 text-emerald-500">U {f}</div>)}
                     </div>
                  )}
                  {gitStatus.modified?.length === 0 && gitStatus.untracked?.length === 0 && gitStatus.staged?.length === 0 && (
                    <div className="text-xs text-[#858585]">No pending changes.</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#858585]">Not a git repository.</div>
              )}
            </div>
          </div>
        )}

        {/* Editor & Terminal area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#1e1e1e]">
          
          {/* File tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center border-b border-[#2d2d2d] bg-[#252526] overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-px text-[12px]">
                {openFiles.map((tab) => (
                  <button
                    key={tab.path}
                    onClick={() => setActiveTabPath(tab.path)}
                    className={`px-3 py-2 flex items-center gap-2 border-r border-[#2d2d2d] transition-colors group ${
                      activeTabPath === tab.path ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2d2d2d]/80 border-t border-t-transparent'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-agent-coder" />
                    <span className={tab.isDirty ? 'italic' : ''}>{tab.name}</span>
                    {tab.isDirty && <div className="w-2 h-2 rounded-full bg-white ml-1 opacity-80" />}
                    <X 
                      className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:bg-[#444] rounded outline-none ml-1" 
                      onClick={(e) => { e.stopPropagation(); closeFile(tab.path); }} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Diffs Bar if an agent proposed code */}
          {isDiffMode && activeFile && (
            <div className="flex items-center justify-between px-4 py-2 bg-agent-coder/10 border-b border-agent-coder/30 shrink-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-agent-coder animate-pulse shadow-[0_0_10px_rgba(33,150,243,0.5)]" />
                 <span className="text-xs font-medium text-agent-coder">NEXUS Agent proposes changes to {activeFile.name}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAcceptDiff} className="flex items-center gap-1.5 px-3 py-1 bg-agent-coder text-void text-xs font-medium rounded hover:bg-agent-coder/90 shadow-lg shadow-agent-coder/20 transition-all">
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={handleRejectDiff} className="flex items-center gap-1.5 px-3 py-1 bg-glass text-text-secondary text-xs rounded hover:bg-glass-hover transition-all border border-glass-border">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Monaco Code display */}
          <div className="flex-1 w-full relative">
            {!activeFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 select-none">
                <img src="/logo.svg" alt="Nexus" className="w-24 h-24 mb-6 grayscale opacity-20" />
                <p className="text-sm font-mono tracking-widest text-white uppercase">NEXUS Code Editor</p>
                <p className="text-xs mt-2 font-mono">Select a file from the explorer to begin.</p>
              </div>
            ) : isDiffMode ? (
              <DiffEditor
                height="100%"
                language={getLanguage(activeFile.name)}
                theme="vs-dark"
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
                theme="vs-dark"
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
          <div className={`border-t border-glass-border bg-void-light transition-all duration-300 flex flex-col shrink-0 ${isTerminalExpanding ? 'h-64' : 'h-10'}`}>
             <div 
               className="flex items-center justify-between px-4 py-2 bg-void/50 border-b border-glass-border cursor-pointer select-none"
               onClick={() => setIsTerminalExpanding(!isTerminalExpanding)}
             >
               <div className="flex items-center gap-2">
                 <TerminalIcon className="w-4 h-4 text-text-muted" />
                 <span className="text-xs font-medium tracking-wide uppercase">Terminal</span>
               </div>
               {isTerminalExpanding ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
             </div>
             
             {isTerminalExpanding && (
               <div className="flex-1 flex flex-col min-h-0 bg-[#000000]">
                 <div 
                   ref={terminalRef}
                   className="flex-1 overflow-y-auto p-3 text-[13px] font-mono leading-relaxed"
                 >
                   {terminalOutput.map((line, i) => (
                     <div key={i} className="whitespace-pre-wrap text-emerald-400/80 mb-1" dangerouslySetInnerHTML={{ __html: line }} />
                   ))}
                 </div>
                 <form onSubmit={handleTerminalSubmit} className="flex items-center px-3 py-2 border-t border-white/5 bg-[#0a0a0a]">
                   <span className="text-emerald-500 font-mono mr-2">➜</span>
                   <span className="text-blue-400 font-mono mr-2">nexus</span>
                   <input 
                     type="text" 
                     value={terminalInput}
                     onChange={(e) => setTerminalInput(e.target.value)}
                     className="flex-1 bg-transparent outline-none text-[13px] font-mono text-white"
                     placeholder="bash command..."
                     autoComplete="off"
                     spellCheck="false"
                   />
                   <button type="submit" className="p-1 hover:bg-white/10 rounded transition-colors" disabled={!terminalInput.trim()}>
                     <Play className="w-4 h-4 text-text-muted hover:text-emerald-400" />
                   </button>
                 </form>
               </div>
             )}
          </div>

        </div>

      </div>

      {isAgentWindowOpen && (
        <FloatingAgentWindow 
          onSuggestDiff={handleSuggestDiff}
          onClose={() => setIsAgentWindowOpen(false)}
          currentCode={activeFile ? activeFile.content : ''}
        />
      )}
    </div>
  );
}
