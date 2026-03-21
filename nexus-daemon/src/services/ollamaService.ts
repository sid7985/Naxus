import { Ollama } from 'ollama';

// The Nexus Daemon hardcodes its reasoning to the local Ollama instance
// to ensure complete data privacy and offline capability.
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaService {
  private defaultModel = 'llama3.2:latest'; // Using the latest small, fast Llama model

  async checkHealth(): Promise<boolean> {
    try {
      await ollama.list();
      return true;
    } catch (e) {
      console.error('[OllamaService] Failed to connect to Ollama:', e);
      return false;
    }
  }

  async generatePlan(prompt: string, history: AgentMessage[] = []): Promise<string> {
    const messages: AgentMessage[] = [
      { 
        role: 'system', 
        content: `You are the NEXUS Auto-Orchestrator Daemon.
Your job is to analyze the user's request and output a strict JSON array of actions using MCP (Model Context Protocol) tools.
Available tools:
1. { "tool": "execute_bash", "command": "echo 'hello'" }
2. { "tool": "deploy_n8n_workflow", "workflow_name": "example" }
3. { "tool": "deploy_nodered_flow", "flow_name": "example" }
4. { "tool": "read_file", "path": "/path/to/file" }

Analyze the request and return ONLY valid JSON. No explanations.`
      },
      ...history,
      { role: 'user', content: prompt }
    ];

    try {
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || this.defaultModel,
        messages: messages,
        format: 'json',
      });
      return response.message.content;
    } catch (error) {
      console.error('[OllamaService] Chat Generation Error:', error);
      throw error;
    }
  }

  async generateCode(taskDescription: string): Promise<string> {
    try {
      const response = await ollama.generate({
        model: process.env.OLLAMA_MODEL || this.defaultModel,
        prompt: `Write code for the following task. Return ONLY the raw code without markdown blocks or explanations.\n\nTask: ${taskDescription}`,
      });
      return response.response;
    } catch (e) {
       console.error('[OllamaService] Code Generation Error:', e);
       throw e;
    }
  }
}

export const ollamaService = new OllamaService();
