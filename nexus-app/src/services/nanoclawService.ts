// ===== NanoClaw Integration Service =====
// Connect NEXUS to NanoClaw AI agent framework with Docker sandboxes

export interface NanoClawConfig {
  baseUrl: string;
  enabled: boolean;
}

export interface NanoClawAgent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  model: string;
  createdAt: string;
}

export interface NanoClawConversation {
  id: string;
  agentId: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
}

const DEFAULT_CONFIG: NanoClawConfig = {
  baseUrl: 'http://localhost:3000',
  enabled: false,
};

class NanoClawService {
  private config: NanoClawConfig;

  constructor(config?: Partial<NanoClawConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  // ===== Health Check =====
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Agent Management =====
  async listAgents(): Promise<NanoClawAgent[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/agents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.agents || [];
    } catch (err) {
      console.error('[NanoClaw] Failed to list agents:', err);
      return [];
    }
  }

  async createAgent(name: string, model: string): Promise<NanoClawAgent | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, model }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[NanoClaw] Failed to create agent:', err);
      return null;
    }
  }

  // ===== Conversations =====
  async sendMessage(agentId: string, message: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/agents/${agentId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.response || null;
    } catch (err) {
      console.error('[NanoClaw] Failed to send message:', err);
      return null;
    }
  }

  async getConversations(agentId: string): Promise<NanoClawConversation[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/agents/${agentId}/conversations`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.conversations || [];
    } catch (err) {
      console.error('[NanoClaw] Failed to get conversations:', err);
      return [];
    }
  }

  // ===== Config =====
  updateConfig(config: Partial<NanoClawConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): NanoClawConfig {
    return { ...this.config };
  }
}

export const nanoclawService = new NanoClawService();
export default NanoClawService;
