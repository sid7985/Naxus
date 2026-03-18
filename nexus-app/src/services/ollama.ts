// ===== Ollama API Service =====
// Connects to local Ollama instance at localhost:11434

import { OLLAMA_API } from '../lib/constants';
import type { OllamaModel } from '../lib/types';

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /** Check if Ollama is running */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  /** List all available models */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(OLLAMA_API.tags);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Ollama listModels error:', error);
      return [];
    }
  }

  /** Chat completion with streaming and optional tools */
  async *chat(
    model: string,
    messages: Array<{ role: string; content: string; tool_calls?: any[] }>,
    systemPrompt?: string,
    tools?: any[]
  ): AsyncGenerator<string | { tool_calls: any[] } | { metrics: { tokens: number; duration: number } }, void, unknown> {
    const body: Record<string, unknown> = {
      model,
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch(OLLAMA_API.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.tool_calls) {
            yield { tool_calls: json.message.tool_calls };
          } else if (json.message?.content) {
            yield json.message.content;
          }
          
          if (json.done && (json.eval_count || json.prompt_eval_count)) {
            const totalTokens = (json.eval_count || 0) + (json.prompt_eval_count || 0);
            yield { metrics: { tokens: totalTokens, duration: Math.floor((json.eval_duration || json.total_duration || 0) / 1000000) } };
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }

  /** Single-shot generation (non-chat) */
  async generate(model: string, prompt: string): Promise<string> {
    const response = await fetch(OLLAMA_API.generate, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama generate error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  /** Pull a new model with progress callback */
  async pullModel(
    name: string,
    onProgress?: (progress: { status: string; completed?: number; total?: number }) => void
  ): Promise<void> {
    const response = await fetch(OLLAMA_API.pull, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Ollama pull error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          onProgress?.(json);
        } catch {
          // skip
        }
      }
    }
  }
}

// Singleton instance
export const ollama = new OllamaService();
