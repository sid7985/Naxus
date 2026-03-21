// ===== OpenCode Integration Service =====
// Connect NEXUS to OpenCode (terminal AI coding agent)
// Note: OpenCode is archived; project moved to Crush by Charmbracelet

export interface OpenCodeConfig {
  binaryPath: string;
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'groq';
  model: string;
}

export interface OpenCodeSession {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

const DEFAULT_CONFIG: OpenCodeConfig = {
  binaryPath: 'opencode',
  enabled: false,
  provider: 'ollama',
  model: 'llama3.2:latest',
};

class OpenCodeService {
  private config: OpenCodeConfig;

  constructor(config?: Partial<OpenCodeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ===== Availability Check =====
  async isInstalled(): Promise<boolean> {
    try {
      // In a Tauri/web environment we can't directly check CLI availability
      // This would need a Tauri command bridge in production
      return this.config.enabled;
    } catch {
      return false;
    }
  }

  // ===== Launch Command =====
  getLaunchCommand(workspacePath?: string): string {
    const parts = [this.config.binaryPath];
    if (workspacePath) {
      parts.push(`--cwd "${workspacePath}"`);
    }
    return parts.join(' ');
  }

  getPromptCommand(prompt: string): string {
    return `${this.config.binaryPath} --prompt "${prompt.replace(/"/g, '\\"')}"`;
  }

  // ===== Config helpers =====
  getEnvSetup(): Record<string, string> {
    const env: Record<string, string> = {};
    switch (this.config.provider) {
      case 'ollama':
        env.OPENCODE_PROVIDER = 'ollama';
        env.OLLAMA_HOST = 'http://localhost:11434';
        break;
      case 'anthropic':
        env.OPENCODE_PROVIDER = 'anthropic';
        break;
      case 'openai':
        env.OPENCODE_PROVIDER = 'openai';
        break;
      case 'gemini':
        env.OPENCODE_PROVIDER = 'google';
        break;
      case 'groq':
        env.OPENCODE_PROVIDER = 'groq';
        break;
    }
    env.OPENCODE_MODEL = this.config.model;
    return env;
  }

  // ===== Config =====
  updateConfig(config: Partial<OpenCodeConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): OpenCodeConfig {
    return { ...this.config };
  }
}

export const opencodeService = new OpenCodeService();
export default OpenCodeService;
