import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MemoryLayer = 'core' | 'project' | 'agent' | 'episodic' | 'semantic';

export interface MemoryEntry {
  id: string;
  content: string;
  layer: MemoryLayer;
  agentId?: string;
  tags: string[];
  timestamp: number;
  importance: 'low' | 'medium' | 'high';
}

interface MemoryState {
  memories: MemoryEntry[];
  addMemory: (memory: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;
  getMemoriesByLayer: (layer: MemoryLayer) => MemoryEntry[];
  getMemoriesByAgent: (agentId: string) => MemoryEntry[];
  searchMemories: (query: string) => MemoryEntry[];
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      memories: [
        { id: 'm-demo-1', content: 'User prefers concise, direct answers.', layer: 'core', tags: ['preference'], timestamp: Date.now() - 86400000, importance: 'high' }
      ],
      
      addMemory: (memory) => {
        set((state) => ({
          memories: [
            {
              ...memory,
              id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
            },
            ...state.memories,
          ],
        }));
      },

      removeMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        }));
      },

      clearMemories: () => {
        set({ memories: [] });
      },

      getMemoriesByLayer: (layer) => {
        return get().memories.filter((m) => m.layer === layer);
      },

      getMemoriesByAgent: (agentId) => {
        return get().memories.filter((m) => m.agentId === agentId || m.layer === 'core' || m.layer === 'project');
      },

      searchMemories: (query) => {
        const lower = query.toLowerCase();
        return get().memories.filter((m) => 
          m.content.toLowerCase().includes(lower) || 
          m.tags.some(t => t.toLowerCase().includes(lower))
        );
      },
    }),
    {
      name: 'nexus-memory-storage',
    }
  )
);
