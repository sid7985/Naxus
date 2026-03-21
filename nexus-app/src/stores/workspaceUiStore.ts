import { create } from 'zustand';

export type SidebarPanelType = 'explorer' | 'search' | 'git' | 'plugins' | 'agents' | 'testing' | null;
export type BottomPanelTab = 'terminal' | 'output' | 'problems' | 'debug';

interface WorkspaceUiState {
  // Sidebar State
  activeSidebarPanel: SidebarPanelType;
  isSidebarOpen: boolean;
  
  // Bottom Panel State
  isBottomPanelOpen: boolean;
  activeBottomPanelTab: BottomPanelTab;
  
  // Actions
  setActiveSidebarPanel: (panel: SidebarPanelType) => void;
  toggleSidebar: () => void;
  setBottomPanelOpen: (isOpen: boolean) => void;
  toggleBottomPanel: () => void;
  setActiveBottomPanelTab: (tab: BottomPanelTab) => void;
}

export const useWorkspaceUiStore = create<WorkspaceUiState>((set) => ({
  activeSidebarPanel: 'explorer',
  isSidebarOpen: true,
  
  isBottomPanelOpen: true,
  activeBottomPanelTab: 'terminal',

  setActiveSidebarPanel: (panel) => set((state) => ({ 
    activeSidebarPanel: panel,
    // Auto-open sidebar if selecting a panel while closed
    isSidebarOpen: state.isSidebarOpen ? state.isSidebarOpen : (panel !== null)
  })),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setBottomPanelOpen: (isOpen) => set({ isBottomPanelOpen: isOpen }),
  
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  
  setActiveBottomPanelTab: (tab) => set(() => ({ 
    activeBottomPanelTab: tab,
    isBottomPanelOpen: true // Auto-open if a tab is clicked
  })),
}));
