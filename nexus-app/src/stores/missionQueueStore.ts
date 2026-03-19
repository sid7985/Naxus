import { create } from 'zustand';

export interface QueuedMission {
  id: string;
  prompt: string;
  skillId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
}

interface MissionQueueState {
  queue: QueuedMission[];
  enqueue: (prompt: string, skillId?: string) => void;
  updateMissionStatus: (id: string, status: QueuedMission['status']) => void;
  removeMission: (id: string) => void;
  clearCompleted: () => void;
}

export const useMissionQueueStore = create<MissionQueueState>((set) => ({
  queue: [],
  enqueue: (prompt, skillId) => set((state) => ({
    queue: [
      ...state.queue,
      {
        id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        skillId,
        status: 'pending',
        startTime: Date.now()
      }
    ]
  })),
  updateMissionStatus: (id, status) => set((state) => ({
    queue: state.queue.map(m => m.id === id ? { ...m, status } : m)
  })),
  removeMission: (id) => set((state) => ({
    queue: state.queue.filter(m => m.id !== id)
  })),
  clearCompleted: () => set((state) => ({
    queue: state.queue.filter(m => m.status !== 'completed' && m.status !== 'failed')
  }))
}));
