import { create } from 'zustand';

// Reusing the type from existing CodeEditorPage
export interface RustFileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: RustFileNode[];
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface EditorState {
  // File Tree
  fileTree: RustFileNode[];
  isLoadingTree: boolean;
  setFileTree: (tree: RustFileNode[]) => void;
  setIsLoadingTree: (isLoading: boolean) => void;
  
  // Open Tabs
  openFiles: OpenFile[];
  activeTabPath: string;
  
  // Actions
  openFile: (path: string, name: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateFileContent: (path: string, newContent: string) => void;
  markFileSaved: (path: string) => void;
  
  // Terminal
  terminalOutput: string[];
  appendTerminalOutput: (lines: string | string[]) => void;
  clearTerminal: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  fileTree: [],
  isLoadingTree: false,
  setFileTree: (tree) => set({ fileTree: tree }),
  setIsLoadingTree: (isLoading) => set({ isLoadingTree: isLoading }),

  openFiles: [],
  activeTabPath: '',

  openFile: (path, name, content) => set((state) => {
    // If already open, just make it active
    if (state.openFiles.find((f) => f.path === path)) {
      return { activeTabPath: path };
    }
    // Otherwise open new tab
    return {
      openFiles: [...state.openFiles, { path, name, content, isDirty: false }],
      activeTabPath: path,
    };
  }),

  closeFile: (path) => set((state) => {
    const newFiles = state.openFiles.filter((f) => f.path !== path);
    return {
      openFiles: newFiles,
      activeTabPath: 
        state.activeTabPath === path 
          ? (newFiles.length > 0 ? newFiles[newFiles.length - 1].path : '')
          : state.activeTabPath
    };
  }),

  setActiveTab: (path) => set({ activeTabPath: path }),

  updateFileContent: (path, newContent) => set((state) => ({
    openFiles: state.openFiles.map((f) => 
      f.path === path ? { ...f, content: newContent, isDirty: true } : f
    )
  })),

  markFileSaved: (path) => set((state) => ({
    openFiles: state.openFiles.map((f) => 
      f.path === path ? { ...f, isDirty: false } : f
    )
  })),
  
  terminalOutput: ['> NEXUS Native Code Editor Initialized.'],
  
  appendTerminalOutput: (lines) => set((state) => {
    const toAppend = Array.isArray(lines) ? lines : [lines];
    return { terminalOutput: [...state.terminalOutput, ...toAppend] };
  }),
  
  clearTerminal: () => set({ terminalOutput: [] }),
}));
