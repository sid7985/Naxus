import { useSettingsStore } from '../../stores/settingsStore';

interface ProxyRequest {
  url: string;
  agent_id: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ProxyResponse {
  success: boolean;
  status_code?: number;
  content?: string;
  error?: string;
  blocked?: boolean;
  reason?: string;
}

export const proxyClient = {
  /**
   * Execute an outward-bound internet request via the NEXUS Python Sidecar.
   * This automatically injects the current internet rules (mode, whitelist) 
   * from the global Zustand store before forwarding to the proxy endpoint.
   */
  async fetch(req: ProxyRequest): Promise<ProxyResponse> {
    const state = useSettingsStore.getState();
    
    try {
      const response = await fetch('http://localhost:1421/network/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...req,
          mode: state.internetMode,
          allowed_domains: state.allowedDomains
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy HTTP error: ${response.status}`);
      }

      const data: ProxyResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('NEXUS Proxy Client Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown proxy fetch error',
        blocked: false
      };
    }
  }
};
