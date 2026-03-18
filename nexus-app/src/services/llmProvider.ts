// ===== Multi-Provider LLM Service =====
// Unified abstraction over Ollama, OpenAI, Anthropic, Gemini, GLM, Groq, Mistral, DeepSeek, xAI

import { useSettingsStore } from '../stores/settingsStore';

export type LLMProviderId =
  | 'ollama'
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'glm'
  | 'groq'
  | 'mistral'
  | 'deepseek'
  | 'xai'
  | 'openrouter';

export interface LLMProviderConfig {
  id: LLMProviderId;
  name: string;
  description: string;
  icon: string;
  baseUrl: string;
  apiKeyRequired: boolean;
  defaultModels: string[];
  color: string;
}

export const LLM_PROVIDERS: LLMProviderConfig[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally on your machine. No API key needed.',
    icon: '🦙',
    baseUrl: 'http://localhost:11434',
    apiKeyRequired: false,
    defaultModels: ['llama3.2:latest', 'mistral:latest', 'codellama:latest', 'gemma2:latest'],
    color: '#ffffff',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, o1, o3 via OpenAI API.',
    icon: '🟢',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyRequired: true,
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini', 'gpt-4-turbo'],
    color: '#10a37f',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus, Haiku.',
    icon: '🔶',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyRequired: true,
    defaultModels: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    color: '#d97706',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini 2.0 Flash, Gemini Pro via Google AI.',
    icon: '💎',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyRequired: true,
    defaultModels: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    color: '#4285f4',
  },
  {
    id: 'glm',
    name: 'GLM / ChatGLM (Zhipu AI)',
    description: 'GLM-4, ChatGLM-Turbo via Zhipu AI BigModel.',
    icon: '🐉',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyRequired: true,
    defaultModels: ['glm-4-plus', 'glm-4-flash', 'glm-4-long', 'glm-4v-plus'],
    color: '#e11d48',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference. Llama, Mixtral on Groq LPUs.',
    icon: '⚡',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKeyRequired: true,
    defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    color: '#f97316',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Medium, codestral via Mistral API.',
    icon: '🌀',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKeyRequired: true,
    defaultModels: ['mistral-large-latest', 'mistral-medium-latest', 'codestral-latest', 'mistral-small-latest'],
    color: '#ff7000',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek-V3, DeepSeek-Coder.',
    icon: '🐋',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyRequired: true,
    defaultModels: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    color: '#4f46e5',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    description: 'Grok-2, Grok-3 via xAI API.',
    icon: '✖️',
    baseUrl: 'https://api.x.ai/v1',
    apiKeyRequired: true,
    defaultModels: ['grok-3', 'grok-3-mini', 'grok-2'],
    color: '#000000',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models with a single API key.',
    icon: '🌐',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyRequired: true,
    defaultModels: ['anthropic/claude-sonnet-4', 'openai/gpt-4o', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.3-70b-instruct'],
    color: '#6366f1',
  },
];

// ============================================
// Unified streaming interface
// ============================================

export type LLMStreamChunk =
  | string
  | { tool_calls: any[] }
  | { metrics: { tokens: number; duration: number } };

/**
 * Resolves the active provider info for a given model string.
 * Model format: "provider:model_name" (e.g. "openai:gpt-4o")
 * If no prefix, defaults to Ollama.
 */
export function parseModelString(modelStr: string): { providerId: LLMProviderId; modelName: string } {
  const colonIdx = modelStr.indexOf(':');
  // Check if it matches a known provider prefix
  if (colonIdx > 0) {
    const prefix = modelStr.substring(0, colonIdx);
    const providerIds = LLM_PROVIDERS.map(p => p.id);
    if (providerIds.includes(prefix as LLMProviderId)) {
      return { providerId: prefix as LLMProviderId, modelName: modelStr.substring(colonIdx + 1) };
    }
  }
  // Default: treat as Ollama model
  return { providerId: 'ollama', modelName: modelStr };
}

/**
 * The main multi-provider chat function. Streams responses.
 */
export async function* chatWithProvider(
  modelStr: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  tools?: any[]
): AsyncGenerator<LLMStreamChunk, void, unknown> {
  const { providerId, modelName } = parseModelString(modelStr);

  if (providerId === 'ollama') {
    // Direct Ollama passthrough (existing behavior)
    yield* ollamaChat(modelName, messages, systemPrompt, tools);
  } else if (providerId === 'anthropic') {
    yield* anthropicChat(modelName, messages, systemPrompt, tools);
  } else if (providerId === 'google') {
    yield* geminiChat(modelName, messages, systemPrompt);
  } else {
    // OpenAI-compatible providers: openai, glm, groq, mistral, deepseek, xai, openrouter
    yield* openaiCompatibleChat(providerId, modelName, messages, systemPrompt, tools);
  }
}

// ============================================
// Provider Implementations
// ============================================

function getApiKey(providerId: LLMProviderId): string {
  const keys = useSettingsStore.getState().providerApiKeys;
  return keys[providerId] || '';
}

function getBaseUrl(providerId: LLMProviderId): string {
  const customUrls = useSettingsStore.getState().providerBaseUrls;
  if (customUrls[providerId]) return customUrls[providerId];
  return LLM_PROVIDERS.find(p => p.id === providerId)?.baseUrl || '';
}

// --- Ollama (Local) ---
async function* ollamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  tools?: any[]
): AsyncGenerator<LLMStreamChunk> {
  const body: Record<string, unknown> = {
    model,
    messages: systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages,
    stream: true,
  };
  if (tools && tools.length > 0) body.tools = tools;

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
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
        if (json.message?.tool_calls) yield { tool_calls: json.message.tool_calls };
        else if (json.message?.content) yield json.message.content;
        if (json.done && (json.eval_count || json.prompt_eval_count)) {
          yield { metrics: { tokens: (json.eval_count || 0) + (json.prompt_eval_count || 0), duration: Math.floor((json.eval_duration || json.total_duration || 0) / 1e6) } };
        }
      } catch { /* skip */ }
    }
  }
}

// --- OpenAI-Compatible (OpenAI, GLM, Groq, Mistral, DeepSeek, xAI, OpenRouter) ---
async function* openaiCompatibleChat(
  providerId: LLMProviderId,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  tools?: any[]
): AsyncGenerator<LLMStreamChunk> {
  const apiKey = getApiKey(providerId);
  const baseUrl = getBaseUrl(providerId);

  if (!apiKey) throw new Error(`No API key configured for ${providerId}. Go to Settings → Providers.`);

  const allMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const body: Record<string, unknown> = {
    model,
    messages: allMessages,
    stream: true,
  };
  if (tools && tools.length > 0) body.tools = tools;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  // OpenRouter requires additional headers
  if (providerId === 'openrouter') {
    headers['HTTP-Referer'] = 'https://nexus-ai-os.local';
    headers['X-Title'] = 'NEXUS AI OS';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${providerId} API error (${response.status}): ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let buffer = '';
  let totalTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      const data = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
      if (!data) continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;
        if (delta?.content) yield delta.content;
        if (delta?.tool_calls) yield { tool_calls: delta.tool_calls };
        // Extract usage from the final chunk
        if (json.usage) {
          totalTokens = json.usage.total_tokens || json.usage.prompt_tokens + json.usage.completion_tokens;
        }
      } catch { /* skip */ }
    }
  }

  if (totalTokens > 0) {
    yield { metrics: { tokens: totalTokens, duration: 0 } };
  }
}

// --- Anthropic (Messages API, non-OpenAI format) ---
async function* anthropicChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  tools?: any[]
): AsyncGenerator<LLMStreamChunk> {
  const apiKey = getApiKey('anthropic');
  if (!apiKey) throw new Error('No API key for Anthropic. Go to Settings → Providers.');

  const body: Record<string, unknown> = {
    model,
    messages: messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
    max_tokens: 8192,
    stream: true,
  };
  if (systemPrompt) body.system = systemPrompt;
  if (tools && tools.length > 0) {
    body.tools = tools.map(t => ({
      name: t.function?.name || t.name,
      description: t.function?.description || '',
      input_schema: t.function?.parameters || {},
    }));
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic error (${response.status}): ${err}`);
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
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        if (json.type === 'content_block_delta' && json.delta?.text) {
          yield json.delta.text;
        }
        if (json.type === 'message_delta' && json.usage) {
          yield { metrics: { tokens: json.usage.output_tokens || 0, duration: 0 } };
        }
      } catch { /* skip */ }
    }
  }
}

// --- Google Gemini (REST streaming) ---
async function* geminiChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
): AsyncGenerator<LLMStreamChunk> {
  const apiKey = getApiKey('google');
  if (!apiKey) throw new Error('No API key for Google Gemini. Go to Settings → Providers.');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error (${response.status}): ${err}`);
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
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
        if (json.usageMetadata) {
          yield { metrics: { tokens: json.usageMetadata.totalTokenCount || 0, duration: 0 } };
        }
      } catch { /* skip */ }
    }
  }
}
