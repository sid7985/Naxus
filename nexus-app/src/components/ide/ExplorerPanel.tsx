import { useState, useEffect } from 'react';
import { useEditorStore, RustFileNode } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { tauri } from '../../services/tauri';
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, RefreshCw } from 'lucide-react';

function FileTreeItem({ node, depth = 0 }: { node: RustFileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const { openFile, activeTabPath } = useEditorStore();

  const handleFileClick = async () => {
    try {
      if (tauri.isTauri) {
        const content = await tauri.readFile(node.path);
        openFile(node.path, node.name, content);
      } else {
        openFile(node.path, node.name, "// Web fallback content. Tauri not available.");
      }
    } catch (e) {
      console.error(e);
      // Fallback for web demo
      openFile(node.path, node.name, "// Failed to load file content.");
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          if (node.is_dir) {
            setExpanded(!expanded);
          } else {
            handleFileClick();
          }
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-left rounded-sm text-[11px] transition-colors ${
          activeTabPath === node.path 
            ? 'bg-[var(--agent-manager)]/10 text-[var(--agent-manager)] font-medium' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {node.is_dir ? (
          <>
            {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
            {expanded ? <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      
      {node.is_dir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorerPanel() {
  const workspacePath = useSettingsStore((s) => s.workspace.workspacePath);
  const { fileTree, setFileTree, isLoadingTree, setIsLoadingTree, appendTerminalOutput } = useEditorStore();

  const loadTree = async () => {
    if (!workspacePath) return;
    setIsLoadingTree(true);
    try {
      if (tauri.isTauri) {
        // Load 3 levels deep initially
        const tree = await tauri.listDirectory(workspacePath, 3);
        setFileTree(tree);
      } else {
        // Web mock
        setFileTree([
          { name: 'src', path: '/src', is_dir: true, children: [
            { name: 'App.tsx', path: '/src/App.tsx', is_dir: false },
            { name: 'index.tsx', path: '/src/index.tsx', is_dir: false }
          ]},
          { name: 'package.json', path: '/package.json', is_dir: false }
        ]);
        appendTerminalOutput('> Warning: Running in web mode. Using mock file system.');
      }
    } catch (e) {
      console.error("Failed to load directory", e);
      appendTerminalOutput(`> Error loading directory: ${e}`);
    } finally {
      setIsLoadingTree(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [workspacePath]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 flex items-center justify-between group">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] truncate">
          {workspacePath ? workspacePath.split('/').pop() : 'NO WORKSPACE'}
        </span>
        <button 
          onClick={loadTree}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-glass-hover)] transition-all"
          title="Refresh Explorer"
        >
          <RefreshCw className={`w-3 h-3 text-[var(--text-muted)] ${isLoadingTree ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-4">
        {fileTree.length === 0 && !isLoadingTree ? (
          <div className="px-4 py-4 text-xs text-[var(--text-muted)] italic">
            No files found in workspace.
          </div>
        ) : (
          fileTree.map((node) => (
            <FileTreeItem key={node.path} node={node} />
          ))
        )}
      </div>
    </div>
  );
}
