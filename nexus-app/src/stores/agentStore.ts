import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AgentStatus, Message } from '../lib/types';
import { DEFAULT_AGENTS } from '../lib/constants';
import { generateId } from '../lib/utils';
import { eventBus } from '../services/eventBus';

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

const MAX_FEED_SIZE = 500;

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
  agents: DEFAULT_AGENTS,
  activeAgentId: null,
  conversations: {},
  missionFeed: [],

  setActiveAgent: (agentId) =>
    set({ activeAgentId: agentId }),

  updateAgentStatus: (agentId, status) =>
    set((state) => {
      eventBus.emit('agent:status-change', { agentId, status });
      return {
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, status } : a
        ),
      };
    }),

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
        ...state.missionFeed.slice(-(MAX_FEED_SIZE - 1)),
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
        const updated = {
          ...a,
          metrics: {
            tokensUsed: a.metrics.tokensUsed + (delta.tokensUsed || 0),
            tasksCompleted: a.metrics.tasksCompleted + (delta.tasksCompleted || 0),
            totalExecutionTimeMs: a.metrics.totalExecutionTimeMs + (delta.totalExecutionTimeMs || 0),
            errorCount: a.metrics.errorCount + (delta.errorCount || 0),
          },
        };
        if (delta.tasksCompleted) {
          eventBus.emit('agent:task-complete', { agentId, taskId: '', result: '' });
          eventBus.emit('notification:add', {
            title: `${a.name} completed a task`,
            body: `+${delta.tasksCompleted} task(s) finished`,
            type: 'success',
          });
        }
        if (delta.errorCount) {
          eventBus.emit('agent:error', { agentId, error: 'Task failed' });
          eventBus.emit('notification:add', {
            title: `${a.name} encountered an error`,
            body: 'Check mission feed for details',
            type: 'error',
          });
        }
        return updated;
      }),
    })),
}),
    {
      name: 'nexus-agent-store',
      partialize: (state) => ({
        conversations: state.conversations,
        missionFeed: state.missionFeed.slice(-100), // Persist last 100 only
      }),
    }
  )
);
