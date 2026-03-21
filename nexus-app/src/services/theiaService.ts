// ===== Eclipse Theia Integration Service =====
// Connect NEXUS to Eclipse Theia IDE

export interface TheiaConfig {
  baseUrl: string;
  enabled: boolean;
  dockerImage: string;
}

const DEFAULT_CONFIG: TheiaConfig = {
  baseUrl: 'http://localhost:3030',
  enabled: false,
  dockerImage: 'theiaide/theia:latest',
};

class TheiaService {
  private config: TheiaConfig;

  constructor(config?: Partial<TheiaConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  // ===== Health Check =====
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(this.baseUrl, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Workspace Info =====
  async getWorkspaceInfo(): Promise<any | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/workspace`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ===== Launch Instructions =====
  getDockerCommand(workspacePath: string): string {
    return `docker run -d --name nexus-theia -p 3030:3000 -v "${workspacePath}:/home/project:cached" ${this.config.dockerImage}`;
  }

  getStopCommand(): string {
    return 'docker stop nexus-theia && docker rm nexus-theia';
  }

  // ===== Config =====
  updateConfig(config: Partial<TheiaConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): TheiaConfig {
    return { ...this.config };
  }
}

export const theiaService = new TheiaService();
export default TheiaService;
