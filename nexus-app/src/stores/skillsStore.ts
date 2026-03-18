import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NexusSkill {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'schedule' | 'file_change' | 'clipboard' | 'webhook';
  triggerConfig: any;
  agentRole: string;
  promptTemplate: string;
  createdAt: number;
}

interface SkillsState {
  skills: NexusSkill[];
  addSkill: (skill: Omit<NexusSkill, 'id' | 'createdAt'>) => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, updates: Partial<NexusSkill>) => void;
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set) => ({
      skills: [
        {
          id: 'skill-1',
          name: 'Summarize Clipboard',
          description: 'Automatically summarizes text copied to the clipboard.',
          trigger: 'clipboard',
          triggerConfig: { matchRegex: '^https?://|.{100,}' },
          agentRole: 'researcher',
          promptTemplate: 'Please summarize the following text I just copied: {{CLIPBOARD}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-2',
          name: 'Format New Notes',
          description: 'Cleans up any markdown files added to the Notes folder.',
          trigger: 'file_change',
          triggerConfig: { path: '~/Documents/NexusNotes', extension: '.md' },
          agentRole: 'coder',
          promptTemplate: 'Format and lint this new markdown note: {{FILE_PATH}}',
          createdAt: Date.now(),
        }
      ],
      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, { ...skill, id: `skill-${Date.now()}`, createdAt: Date.now() }]
      })),
      removeSkill: (id) => set((state) => ({
        skills: state.skills.filter(s => s.id !== id)
      })),
      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map(s => s.id === id ? { ...s, ...updates } : s)
      }))
    }),
    { name: 'nexus-skills-store' }
  )
);
