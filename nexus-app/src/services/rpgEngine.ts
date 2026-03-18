import { useAgentStore } from '../stores/agentStore';
import { useRpgStore } from '../stores/rpgStore';
import type { AgentRole } from '../lib/types';
import { DEFAULT_AGENTS } from '../lib/constants';

let isInitialized = false;

export function initializeRpgEngine() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('[RPG Engine] Initialized and syncing with AgentStore');

  // Subscribe to agent store changes
  useAgentStore.subscribe((state, prevState) => {
    
    // Check for status changes on any agent
    DEFAULT_AGENTS.forEach((agent) => {
      const role = agent.role as AgentRole;
      const currentAgent = state.agents.find(a => a.role === role);
      const prevAgent = prevState.agents.find(a => a.role === role);

      if (!currentAgent || !prevAgent) return;

      // Status changed
      if (currentAgent.status !== prevAgent.status) {
        
        // Map AgentStatus to RPGState
        switch (currentAgent.status) {
          case 'idle':
            useRpgStore.getState().setAgentState(role, 'idle');
            break;
          case 'thinking':
            useRpgStore.getState().setAgentState(role, 'thinking');
            useRpgStore.getState().addSpeechBubble(role, "Let me think...", 2000);
            break;
          case 'acting':
            useRpgStore.getState().setAgentState(role, 'working');
            break;
          case 'done':
            useRpgStore.getState().setAgentState(role, 'done');
            useRpgStore.getState().addSpeechBubble(role, "Task completed!", 3000);
            
            // Revert back to idle after a short celebration
            setTimeout(() => {
              if (useAgentStore.getState().agents.find(a => a.role === role)?.status === 'done') {
                useRpgStore.getState().setAgentState(role, 'idle');
              }
            }, 3000);
            break;
          case 'error':
            useRpgStore.getState().setAgentState(role, 'error');
            useRpgStore.getState().addSpeechBubble(role, "Oops, I hit an error!", 4000);
            break;
        }
      }
    });

    // (Mission tracking disabled for now until orchestrator state mapping is added)
  });
}
