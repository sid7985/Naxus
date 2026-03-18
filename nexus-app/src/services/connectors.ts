// ===== NEXUS Third-Party Connectors Service =====
// Unified interface for external service integrations

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface ConnectorConfig {
  id: string;
  name: string;
  icon: string;
  category: 'automation' | 'communication' | 'storage' | 'development' | 'ai' | 'analytics';
  description: string;
  color: string;
  status: ConnectorStatus;
  baseUrl?: string;
  apiKey?: string;
  webhookUrl?: string;
  features: string[];
  docsUrl: string;
}

// ===== Built-in Connector Registry =====
export const CONNECTOR_REGISTRY: ConnectorConfig[] = [
  // === Automation ===
  {
    id: 'n8n', name: 'n8n', icon: '⚡', category: 'automation',
    description: 'Open-source workflow automation. Connect 400+ apps with NEXUS agents.',
    color: '#FF6D5A', status: 'disconnected', baseUrl: 'http://localhost:5678',
    features: ['Workflow triggers', 'Webhook integration', 'Agent-triggered automations', 'Schedule missions'],
    docsUrl: 'https://docs.n8n.io',
  },
  {
    id: 'make', name: 'Make (Integromat)', icon: '🔗', category: 'automation',
    description: 'Visual automation platform. Create scenarios connecting NEXUS to 1000+ apps.',
    color: '#6D28D9', status: 'disconnected',
    features: ['Scenario triggers', 'HTTP webhooks', 'Data transformation', 'Scheduled runs'],
    docsUrl: 'https://www.make.com/en/integrations',
  },
  {
    id: 'zapier', name: 'Zapier', icon: '⚡', category: 'automation',
    description: 'Connect NEXUS with 6000+ apps via Zaps.',
    color: '#FF4F00', status: 'disconnected',
    features: ['Webhook triggers', 'Multi-step Zaps', 'Scheduled triggers', 'Filters & paths'],
    docsUrl: 'https://zapier.com/apps',
  },

  // === Communication ===
  {
    id: 'slack', name: 'Slack', icon: '💬', category: 'communication',
    description: 'Post agent updates to Slack channels. Trigger missions from Slack commands.',
    color: '#4A154B', status: 'disconnected',
    features: ['Channel notifications', 'Slash commands', 'Bot responses', 'File sharing'],
    docsUrl: 'https://api.slack.com',
  },
  {
    id: 'discord', name: 'Discord', icon: '🎮', category: 'communication',
    description: 'Discord bot integration for team collaboration with NEXUS agents.',
    color: '#5865F2', status: 'disconnected',
    features: ['Bot commands', 'Channel webhooks', 'Thread updates', 'Embed messages'],
    docsUrl: 'https://discord.com/developers',
  },
  {
    id: 'telegram', name: 'Telegram', icon: '📱', category: 'communication',
    description: 'Control NEXUS via Telegram bot. Get mission updates directly.',
    color: '#0088CC', status: 'disconnected',
    features: ['Bot commands', 'Inline queries', 'Push notifications', 'File transfer'],
    docsUrl: 'https://core.telegram.org/bots/api',
  },
  {
    id: 'email', name: 'Email (SMTP)', icon: '📧', category: 'communication',
    description: 'Send reports, alerts, and mission summaries via email.',
    color: '#EA4335', status: 'disconnected',
    features: ['Send reports', 'Digest emails', 'Alert notifications', 'HTML templates'],
    docsUrl: 'https://nodemailer.com',
  },

  // === Storage ===
  {
    id: 'notion', name: 'Notion', icon: '📝', category: 'storage',
    description: 'Sync project data, mission logs, and knowledge base with Notion.',
    color: '#000000', status: 'disconnected',
    features: ['Page creation', 'Database sync', 'Knowledge import', 'Mission logging'],
    docsUrl: 'https://developers.notion.com',
  },
  {
    id: 'github', name: 'GitHub', icon: '🐙', category: 'development',
    description: 'Issues, PRs, Actions, and repository management from NEXUS.',
    color: '#333333', status: 'disconnected',
    features: ['Issue creation', 'PR management', 'Actions triggers', 'Code review'],
    docsUrl: 'https://docs.github.com/en/rest',
  },
  {
    id: 'linear', name: 'Linear', icon: '📋', category: 'development',
    description: 'Project management integration. Auto-create issues from missions.',
    color: '#5E6AD2', status: 'disconnected',
    features: ['Issue creation', 'Status updates', 'Sprint planning', 'Label automation'],
    docsUrl: 'https://linear.app/docs/api',
  },
  {
    id: 'supabase', name: 'Supabase', icon: '🟢', category: 'storage',
    description: 'Open-source Firebase alternative. Store mission data and user analytics.',
    color: '#3ECF8E', status: 'disconnected',
    features: ['Database queries', 'Auth integration', 'Real-time sync', 'Storage'],
    docsUrl: 'https://supabase.com/docs',
  },

  // === AI ===
  {
    id: 'openai', name: 'OpenAI', icon: '🤖', category: 'ai',
    description: 'Fallback to GPT-4 / GPT-4o for complex tasks when Ollama isn\'t sufficient.',
    color: '#10A37F', status: 'disconnected',
    features: ['GPT-4 fallback', 'DALL-E images', 'Embeddings', 'Whisper STT'],
    docsUrl: 'https://platform.openai.com/docs',
  },
  {
    id: 'anthropic', name: 'Anthropic', icon: '🧬', category: 'ai',
    description: 'Claude API for long-context reasoning and analysis tasks.',
    color: '#D4A574', status: 'disconnected',
    features: ['Claude reasoning', '200K context', 'Document analysis', 'Code generation'],
    docsUrl: 'https://docs.anthropic.com',
  },
  {
    id: 'huggingface', name: 'HuggingFace', icon: '🤗', category: 'ai',
    description: 'Access 200K+ models for specialized AI tasks.',
    color: '#FFD21E', status: 'disconnected',
    features: ['Model inference', 'Embedding models', 'Custom pipelines', 'Spaces'],
    docsUrl: 'https://huggingface.co/docs/api-inference',
  },

  // === Analytics ===
  {
    id: 'posthog', name: 'PostHog', icon: '🦔', category: 'analytics',
    description: 'Product analytics. Track agent usage, mission completion, and user flows.',
    color: '#F9BD2B', status: 'disconnected',
    features: ['Event tracking', 'Session replay', 'Feature flags', 'Funnels'],
    docsUrl: 'https://posthog.com/docs/api',
  },
  {
    id: 'sentry', name: 'Sentry', icon: '🛡️', category: 'analytics',
    description: 'Error tracking and performance monitoring for NEXUS.',
    color: '#362D59', status: 'disconnected',
    features: ['Error tracking', 'Performance monitoring', 'Release tracking', 'Alerting'],
    docsUrl: 'https://docs.sentry.io',
  },
];

// ===== Connector Service =====
class ConnectorService {
  private connectors: Map<string, ConnectorConfig> = new Map();

  constructor() {
    CONNECTOR_REGISTRY.forEach((c) => this.connectors.set(c.id, { ...c }));
  }

  getAll(): ConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  getByCategory(category: ConnectorConfig['category']): ConnectorConfig[] {
    return this.getAll().filter((c) => c.category === category);
  }

  getConnected(): ConnectorConfig[] {
    return this.getAll().filter((c) => c.status === 'connected');
  }

  async testConnection(id: string): Promise<boolean> {
    const connector = this.connectors.get(id);
    if (!connector?.baseUrl) return false;

    try {
      const res = await fetch(connector.baseUrl, { signal: AbortSignal.timeout(5000) });
      const status: ConnectorStatus = res.ok ? 'connected' : 'error';
      this.connectors.set(id, { ...connector, status });
      return res.ok;
    } catch {
      this.connectors.set(id, { ...connector, status: 'error' });
      return false;
    }
  }

  updateConfig(id: string, update: Partial<ConnectorConfig>): boolean {
    const connector = this.connectors.get(id);
    if (!connector) return false;
    this.connectors.set(id, { ...connector, ...update });
    return true;
  }

  getById(id: string): ConnectorConfig | undefined {
    return this.connectors.get(id);
  }
}

export const connectorService = new ConnectorService();
export default ConnectorService;
