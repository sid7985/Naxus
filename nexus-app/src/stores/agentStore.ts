import { create } from 'zustand';
import type { Agent, AgentStatus, Message } from '../lib/types';
import { DEFAULT_AGENTS } from '../lib/constants';
import { generateId } from '../lib/utils';

interface AgentState {
  agents: Agent[];
  activeAgentId: string | null;
  conversations: Record<string, Message[]>;  // agentId -> messages
  missionFeed: Message[];

  // Actions
  setActiveAgent: (agentId: string | null) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  updateAgentModel: (agentId: string, model: string) => void;
  updateAgentPersonality: (agentId: string, tone: number, detail: number) => void;
  addMessage: (agentId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  addMissionFeedMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (agentId: string, content: string) => void;
  clearConversation: (agentId: string) => void;
  incrementAgentMetrics: (agentId: string, metrics: Partial<Agent['metrics']>) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: DEFAULT_AGENTS,
  activeAgentId: null,
  conversations: {},
  missionFeed: [],

  setActiveAgent: (agentId) =>
    set({ activeAgentId: agentId }),

  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
    })),

  updateAgentModel: (agentId, model) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, model } : a
      ),
    })),

  updateAgentPersonality: (agentId, tone, detail) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, personality: { tone, detail } } : a
      ),
    })),

  addMessage: (agentId, message) =>
    set((state) => {
      const existing = state.conversations[agentId] || [];
      const fullMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      };
      return {
        conversations: {
          ...state.conversations,
          [agentId]: [...existing, fullMessage],
        },
      };
    }),

  addMissionFeedMessage: (message) =>
    set((state) => ({
      missionFeed: [
        ...state.missionFeed,
        { ...message, id: generateId(), timestamp: Date.now() },
      ],
    })),

  updateLastMessage: (agentId, content) =>
    set((state) => {
      const messages = state.conversations[agentId] || [];
      if (messages.length === 0) return state;
      const updated = [...messages];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content,
        isStreaming: false,
      };
      return {
        conversations: { ...state.conversations, [agentId]: updated },
      };
    }),

  clearConversation: (agentId) =>
    set((state) => ({
      conversations: { ...state.conversations, [agentId]: [] },
    })),

  incrementAgentMetrics: (agentId, delta) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId) return a;
        return {
          ...a,
          metrics: {
            tokensUsed: a.metrics.tokensUsed + (delta.tokensUsed || 0),
            tasksCompleted: a.metrics.tasksCompleted + (delta.tasksCompleted || 0),
            totalExecutionTimeMs: a.metrics.totalExecutionTimeMs + (delta.totalExecutionTimeMs || 0),
            errorCount: a.metrics.errorCount + (delta.errorCount || 0),
          },
        };
      }),
    })),
}));
