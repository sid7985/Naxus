// ===== NEXUS n8n Integration Service =====
// Connect NEXUS agents to n8n workflows for powerful automation

export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  data?: Record<string, unknown>;
}

export interface N8nWebhook {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  active: boolean;
}

const DEFAULT_CONFIG: N8nConfig = {
  baseUrl: 'http://localhost:5678',
  enabled: false,
};

class N8nService {
  private config: N8nConfig;

  constructor(config?: Partial<N8nConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      h['X-N8N-API-KEY'] = this.config.apiKey;
    }
    return h;
  }

  private get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  // ===== Health Check =====
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/healthz`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Workflow Management =====
  async listWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.error('[n8n] Failed to list workflows:', err);
      return [];
    }
  }

  async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows/${id}`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[n8n] Failed to get workflow ${id}:`, err);
      return null;
    }
  }

  async activateWorkflow(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows/${id}/activate`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deactivateWorkflow(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows/${id}/deactivate`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Execution =====
  async executeWorkflow(id: string, data?: Record<string, unknown>): Promise<N8nExecution | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows/${id}/execute`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[n8n] Failed to execute workflow ${id}:`, err);
      return null;
    }
  }

  async getExecution(id: string): Promise<N8nExecution | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/executions/${id}`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[n8n] Failed to get execution ${id}:`, err);
      return null;
    }
  }

  async listExecutions(workflowId?: string): Promise<N8nExecution[]> {
    try {
      const url = workflowId
        ? `${this.baseUrl}/api/v1/executions?workflowId=${workflowId}`
        : `${this.baseUrl}/api/v1/executions`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.error('[n8n] Failed to list executions:', err);
      return [];
    }
  }

  // ===== Webhooks =====
  async triggerWebhook(path: string, data?: Record<string, unknown>): Promise<unknown> {
    try {
      const res = await fetch(`${this.baseUrl}/webhook/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[n8n] Webhook trigger failed for ${path}:`, err);
      return null;
    }
  }

  // ===== NEXUS-specific helper: create agent workflow =====
  async createAgentWorkflow(
    name: string,
    agentRole: string,
    triggerType: 'webhook' | 'cron' | 'manual',
    action: string
  ): Promise<string | null> {
    // This creates a workflow JSON payload compatible with n8n's workflow format
    const workflow = {
      name: `NEXUS: ${name}`,
      nodes: [
        {
          parameters: triggerType === 'webhook'
            ? { path: `nexus-${name.toLowerCase().replace(/\s+/g, '-')}`, method: 'POST' }
            : triggerType === 'cron'
            ? { rule: { interval: [{ field: 'hours', hour: 9 }] } }
            : {},
          name: 'Trigger',
          type: triggerType === 'webhook' ? 'n8n-nodes-base.webhook'
            : triggerType === 'cron' ? 'n8n-nodes-base.cron'
            : 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: 'http://localhost:11434/api/generate',
            method: 'POST',
            body: JSON.stringify({
              model: 'llama3.2:latest',
              prompt: `[NEXUS ${agentRole}] ${action}`,
              stream: false,
            }),
          },
          name: `NEXUS ${agentRole}`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
        },
      ],
      connections: {
        Trigger: { main: [[{ node: `NEXUS ${agentRole}`, type: 'main', index: 0 }]] },
      },
      active: false,
      settings: {},
      tags: ['nexus', agentRole.toLowerCase()],
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(workflow),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      return created.id;
    } catch (err) {
      console.error('[n8n] Failed to create agent workflow:', err);
      return null;
    }
  }

  // ===== Config =====
  updateConfig(config: Partial<N8nConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): N8nConfig {
    return { ...this.config };
  }
}

export const n8nService = new N8nService();
export default N8nService;
