import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NexusSkill {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'schedule' | 'file_change' | 'clipboard' | 'webhook';
  triggerConfig?: any;
  cronSchedule?: string; // Format: "* * * * *" (min, hour, dom, mon, dow)
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
          description: 'Automatically summarizes long text or URLs copied to the clipboard.',
          trigger: 'clipboard',
          triggerConfig: { matchRegex: '^https?://|.{100,}' },
          agentRole: 'researcher',
          promptTemplate: 'Please summarize the following text I just copied and extract key action items: {{CLIPBOARD}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-2',
          name: 'Auto-Format Markdowns',
          description: 'Cleans up and lints any new .md files in your workspace.',
          trigger: 'file_change',
          triggerConfig: { path: '', extension: '.md' },
          agentRole: 'coder',
          promptTemplate: 'Format and lint this markdown file to ensure perfect structure: {{FILE_PATH}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-3',
          name: 'Commit on Save',
          description: 'Creates a semantic git commit whenever a source file is modified.',
          trigger: 'file_change',
          triggerConfig: { path: 'src/', extension: '.ts' },
          agentRole: 'coder',
          promptTemplate: 'Analyze the changes in {{FILE_PATH}} and create a concise semantic git commit message.',
          createdAt: Date.now(),
        },
        {
          id: 'skill-4',
          name: 'Translate Snippets',
          description: 'Translates any copied non-English text to English.',
          trigger: 'clipboard',
          triggerConfig: { matchRegex: '[^\\x00-\\x7F]' },
          agentRole: 'researcher',
          promptTemplate: 'Translate this text into clear English: {{CLIPBOARD}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-5',
          name: 'Security Audit',
          description: 'Audits new Python scripts for potential vulnerabilities.',
          trigger: 'file_change',
          triggerConfig: { path: 'scripts/', extension: '.py' },
          agentRole: 'tester',
          promptTemplate: 'Perform a security audit on this Python script: {{FILE_PATH}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-6',
          name: 'Log Analysis',
          description: 'Alerts you if an error log is detected.',
          trigger: 'file_change',
          triggerConfig: { path: 'logs/', extension: '.log' },
          agentRole: 'tester',
          promptTemplate: 'Analyze this log file. If there are CRITICAL errors, report them: {{FILE_PATH}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-7',
          name: 'Deep Web Search',
          description: 'Searches for technical documentation whenever a term is copied.',
          trigger: 'clipboard',
          triggerConfig: { matchRegex: '^[a-zA-Z0-9_]{3,20}$' },
          agentRole: 'researcher',
          promptTemplate: 'Find the official documentation and best practices for: {{CLIPBOARD}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-8',
          name: 'Design Review',
          description: 'Reviews new CSS/Tailwind files for accessibility and design tokens.',
          trigger: 'file_change',
          triggerConfig: { path: 'src/styles/', extension: '.css' },
          agentRole: 'designer',
          promptTemplate: 'Review this CSS file for accessibility and consistency with our design tokens: {{FILE_PATH}}',
          createdAt: Date.now(),
        },
        {
          id: 'skill-9',
          name: 'Daily Standup Summarizer',
          description: 'Runs every morning at 9 AM to summarize yesterday\'s git commits.',
          trigger: 'schedule',
          cronSchedule: '0 9 * * *',
          agentRole: 'manager',
          promptTemplate: 'Analyze all `.git` changes in the workspace from yesterday and write a brief daily standup summary.',
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
