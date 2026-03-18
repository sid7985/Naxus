import { create } from 'zustand';
import type { AgentRole } from '../lib/types';

export type RPGState = 'idle' | 'thinking' | 'walking' | 'working' | 'done' | 'error';

export interface Position {
  x: number;
  y: number;
}

export interface SpeechBubble {
  id: string;
  text: string;
  durationMs: number;
  createdAt: number;
}

export interface AgentRPGData {
  role: AgentRole;
  state: RPGState;
  position: Position;
  targetPosition: Position | null;
  speechBubbles: SpeechBubble[];
  completionProgress: number; // 0 to 100
}

interface RPGWorldState {
  agents: Record<AgentRole, AgentRPGData>;
  activeQuest: {
    id: string;
    description: string;
    tasks: { agentId: AgentRole; description: string; status: 'pending' | 'active' | 'completed' }[];
  } | null;

  // Actions
  setAgentState: (role: AgentRole, state: RPGState) => void;
  setAgentPosition: (role: AgentRole, position: Position) => void;
  setAgentTarget: (role: AgentRole, target: Position | null) => void;
  addSpeechBubble: (role: AgentRole, text: string, durationMs?: number) => void;
  removeSpeechBubble: (role: AgentRole, bubbleId: string) => void;
  setActiveQuest: (quest: RPGWorldState['activeQuest']) => void;
  updateQuestTask: (agentId: AgentRole, status: 'pending' | 'active' | 'completed') => void;
}

// Initial desk positions in the isometric office grid (percentages)
const INITIAL_POSITIONS: Record<AgentRole, Position> = {
  manager: { x: 20, y: 70 },
  coder: { x: 35, y: 50 },
  designer: { x: 50, y: 30 },
  tester: { x: 65, y: 50 },
  researcher: { x: 80, y: 70 },
  marketer: { x: 50, y: 80 },
};

const createInitialAgent = (role: AgentRole): AgentRPGData => ({
  role,
  state: 'idle',
  position: INITIAL_POSITIONS[role],
  targetPosition: null,
  speechBubbles: [],
  completionProgress: 0,
});

export const useRpgStore = create<RPGWorldState>((set) => ({
  agents: {
    manager: createInitialAgent('manager'),
    coder: createInitialAgent('coder'),
    designer: createInitialAgent('designer'),
    tester: createInitialAgent('tester'),
    researcher: createInitialAgent('researcher'),
    marketer: createInitialAgent('marketer'),
  },
  activeQuest: null,

  setAgentState: (role, state) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [role]: { ...s.agents[role], state },
      },
    })),

  setAgentPosition: (role, position) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [role]: { ...s.agents[role], position },
      },
    })),

  setAgentTarget: (role, target) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [role]: { ...s.agents[role], targetPosition: target },
      },
    })),

  addSpeechBubble: (role, text, durationMs = 3000) => {
    const id = Math.random().toString(36).substring(7);
    set((s) => ({
      agents: {
        ...s.agents,
        [role]: {
          ...s.agents[role],
          speechBubbles: [
            ...s.agents[role].speechBubbles,
            { id, text, durationMs, createdAt: Date.now() },
          ],
        },
      },
    }));

    // Auto-remove
    setTimeout(() => {
      set((s) => ({
        agents: {
          ...s.agents,
          [role]: {
            ...s.agents[role],
            speechBubbles: s.agents[role].speechBubbles.filter((b) => b.id !== id),
          },
        },
      }));
    }, durationMs);
  },

  removeSpeechBubble: (role, bubbleId) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [role]: {
          ...s.agents[role],
          speechBubbles: s.agents[role].speechBubbles.filter((b) => b.id !== bubbleId),
        },
      },
    })),

  setActiveQuest: (quest) => set({ activeQuest: quest }),

  updateQuestTask: (agentId, status) =>
    set((s) => {
      if (!s.activeQuest) return s;
      return {
        activeQuest: {
          ...s.activeQuest,
          tasks: s.activeQuest.tasks.map((t) =>
            t.agentId === agentId ? { ...t, status } : t
          ),
        },
      };
    }),
}));
