import { listen } from '@tauri-apps/api/event';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { AgentOrchestrator } from './orchestrator';
import { useSkillsStore } from '../stores/skillsStore';
import { useMissionQueueStore } from '../stores/missionQueueStore';
import { memoryService } from './memory';

class MissionQueueManager {
  private isProcessing = false;
  private lastClipboard = '';

  constructor() {
    this.startBackgroundWatchers();
  }

  enqueue(prompt: string, skillId?: string) {
    useMissionQueueStore.getState().enqueue(prompt, skillId);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    
    const store = useMissionQueueStore.getState();
    const pendingMission = store.queue.find(m => m.status === 'pending');
    
    if (!pendingMission) return;
    
    this.isProcessing = true;
    store.updateMissionStatus(pendingMission.id, 'running');
    
    try {
      console.log(`🚀 Executing async mission: ${pendingMission.prompt}`);
      const orchestrator = new AgentOrchestrator();
      await orchestrator.executeMission(pendingMission.prompt);
      store.updateMissionStatus(pendingMission.id, 'completed');
    } catch (error) {
      console.error(`❌ Mission failed: ${pendingMission.id}`, error);
      store.updateMissionStatus(pendingMission.id, 'failed');
    } finally {
      this.isProcessing = false;
      // Recursively process next in queue
      this.processQueue();
    }
  }

  private async startBackgroundWatchers() {
    // 1. Listen to native file system changes from Rust
    listen('file-changed', (event) => {
      const paths = event.payload as string[];
      const skills = useSkillsStore.getState().skills.filter(s => s.trigger === 'file_change');
      
      for (const path of paths) {
        // [PHASE 10] Real-time re-indexing on file change
        if (path.match(/\.(md|txt|py|js|ts|tsx|json|csv|html)$/i)) {
          console.log(`[Auto-Indexer] Re-indexing modified file: ${path}`);
          memoryService.indexDocument(path).catch((e: any) => console.error('Auto-index failed', e));
        }

        for (const skill of skills) {
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
               try {
                 const regex = new RegExp(regexStr);
                 if (regex.test(text)) {
                   const prompt = skill.promptTemplate.replace('{{CLIPBOARD}}', text);
                   this.enqueue(prompt, skill.id);
                 }
               } catch (e) {
                 console.error("Invalid regex in skill:", skill.id, e);
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

    // 3. CRON Scheduler Watcher (Runs precisely every 60 seconds on the minute mark)
    setInterval(() => {
      const now = new Date();
      // Only fire exactly at the start of a minute to avoid double-triggers
      if (now.getSeconds() === 0) {
        const skills = useSkillsStore.getState().skills.filter(s => s.trigger === 'schedule' && s.cronSchedule);
        
        skills.forEach(skill => {
          const parts = skill.cronSchedule!.split(' ');
          if (parts.length !== 5) return;
          
          const [minute, hour, dom, month, dow] = parts;
          
          const matchMin = minute === '*' || parseInt(minute) === now.getMinutes();
          const matchHour = hour === '*' || parseInt(hour) === now.getHours();
          const matchDom = dom === '*' || parseInt(dom) === now.getDate();
          const matchMonth = month === '*' || parseInt(month) === now.getMonth() + 1; // 1-12
          const matchDow = dow === '*' || parseInt(dow) === now.getDay(); // 0-6

          if (matchMin && matchHour && matchDom && matchMonth && matchDow) {
            console.log(`⏰ CRON Trigger Matched: ${skill.name} (${skill.cronSchedule})`);
            this.enqueue(skill.promptTemplate, skill.id);
          }
        });
      }
    }, 1000); // Check every second to catch the exact 0th second
  }
}

export const missionQueue = new MissionQueueManager();
