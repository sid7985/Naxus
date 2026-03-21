// ===== Node-RED Integration Service =====
// Connect NEXUS to Node-RED for flow-based visual programming

export interface NodeRedConfig {
  baseUrl: string;
  enabled: boolean;
}

export interface NodeRedFlow {
  id: string;
  label: string;
  type: string;
  disabled: boolean;
  nodes: number;
}

const DEFAULT_CONFIG: NodeRedConfig = {
  baseUrl: 'http://localhost:1880',
  enabled: false,
};

class NodeRedService {
  private config: NodeRedConfig;

  constructor(config?: Partial<NodeRedConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  // ===== Health Check =====
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/settings`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Flow Management =====
  async listFlows(): Promise<NodeRedFlow[]> {
    try {
      const res = await fetch(`${this.baseUrl}/flows`, {
        headers: { 'Node-RED-API-Version': 'v2' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const flows = (data.flows || data || []) as any[];
      return flows
        .filter((f: any) => f.type === 'tab')
        .map((f: any) => ({
          id: f.id,
          label: f.label || 'Untitled Flow',
          type: f.type,
          disabled: f.disabled || false,
          nodes: flows.filter((n: any) => n.z === f.id).length,
        }));
    } catch (err) {
      console.error('[Node-RED] Failed to list flows:', err);
      return [];
    }
  }

  async getFlow(id: string): Promise<any | null> {
    try {
      const res = await fetch(`${this.baseUrl}/flow/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[Node-RED] Failed to get flow ${id}:`, err);
      return null;
    }
  }

  async deployFlows(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Node-RED-Deployment-Type': 'full',
        },
        body: JSON.stringify({ flows: [] }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async injectNode(nodeId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/inject/${nodeId}`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Settings =====
  async getSettings(): Promise<any | null> {
    try {
      const res = await fetch(`${this.baseUrl}/settings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  // ===== Config =====
  updateConfig(config: Partial<NodeRedConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): NodeRedConfig {
    return { ...this.config };
  }
}

export const nodeRedService = new NodeRedService();
export default NodeRedService;
