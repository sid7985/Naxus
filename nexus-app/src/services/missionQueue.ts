import { listen } from '@tauri-apps/api/event';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { AgentOrchestrator } from './orchestrator';
import { useSkillsStore } from '../stores/skillsStore';

class MissionQueueManager {
  private isRunning = false;
  private queue: { prompt: string, skillId?: string }[] = [];
  private lastClipboard = '';

  constructor() {
    this.startBackgroundWatchers();
  }

  enqueue(prompt: string, skillId?: string) {
    this.queue.push({ prompt, skillId });
    this.processQueue();
  }

  private async processQueue() {
    if (this.isRunning || this.queue.length === 0) return;
    
    this.isRunning = true;
    const task = this.queue.shift();
    
    if (task) {
      console.log(`🚀 Executing async mission: ${task.prompt}`);
      const orchestrator = new AgentOrchestrator();
      
      // We pass the task prompt to the orchestrator to execute headless
      // Mapped back to the global store automatically.
      await orchestrator.executeMission(task.prompt);
    }
    
    this.isRunning = false;
    
    // Check if more tasks exist
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  private async startBackgroundWatchers() {
    // 1. Listen to native file system changes from Rust
    listen('file-changed', (event) => {
      const paths = event.payload as string[];
      const skills = useSkillsStore.getState().skills.filter(s => s.trigger === 'file_change');
      
      for (const skill of skills) {
        for (const path of paths) {
          if (path.includes(skill.triggerConfig?.path || '') && path.endsWith(skill.triggerConfig?.extension || '')) {
            const prompt = skill.promptTemplate.replace('{{FILE_PATH}}', path);
            this.enqueue(prompt, skill.id);
          }
        }
      }
    });

    // 2. Poll clipboard every 2 seconds for clipboard triggers
    setInterval(async () => {
      try {
        const text = await readText();
        if (text && text !== this.lastClipboard) {
          this.lastClipboard = text;
          
          const skills = useSkillsStore.getState().skills.filter(s => s.trigger === 'clipboard');
          for (const skill of skills) {
            const regexStr = skill.triggerConfig?.matchRegex;
            if (regexStr) {
               const regex = new RegExp(regexStr);
               if (regex.test(text)) {
                 const prompt = skill.promptTemplate.replace('{{CLIPBOARD}}', text);
                 this.enqueue(prompt, skill.id);
               }
            } else {
               const prompt = skill.promptTemplate.replace('{{CLIPBOARD}}', text);
               this.enqueue(prompt, skill.id);
            }
          }
        }
      } catch (e) {
        // clipboard might be empty or locked
      }
    }, 2000);
  }
}

export const missionQueue = new MissionQueueManager();
