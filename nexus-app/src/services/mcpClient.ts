// mcpClient.ts
// Communicates with the Python Sidecar MCP Host (localhost:1421/mcp)

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  is_active: boolean;
}

const MCP_API_URL = 'http://localhost:1421/mcp';

export const mcpClient = {
  /**
   * List all registered MCP servers.
   */
  async getServers(): Promise<MCPServerConfig[]> {
    try {
      const res = await fetch(`${MCP_API_URL}/servers`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.success ? data.servers : [];
    } catch (e) {
      console.error('Failed to get MCP servers:', e);
      return [];
    }
  },

  /**
   * Install and start a new MCP server.
   */
  async installServer(config: Omit<MCPServerConfig, 'is_active'>): Promise<boolean> {
    try {
      const res = await fetch(`${MCP_API_URL}/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to install MCP server:', e);
      return false;
    }
  },

  /**
   * Stop and remove an MCP server.
   */
  async uninstallServer(serverId: string): Promise<boolean> {
    try {
      const res = await fetch(`${MCP_API_URL}/servers/${serverId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to uninstall MCP server:', e);
      return false;
    }
  },

  /**
   * Get all tools exposed by all active MCP servers.
   * Returns a flat list of tools, prefixed by `serverId___toolName`.
   */
  async getAllTools(): Promise<MCPTool[]> {
    try {
      const res = await fetch(`${MCP_API_URL}/tools`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.success ? data.tools : [];
    } catch (e) {
      console.error('Failed to get MCP tools:', e);
      return [];
    }
  },

  /**
   * Execute a specific tool on a specific server.
   * @param prexiedToolName Extracted from the `getAllTools()` listing (e.g. `mcp-fs___read_file`)
   * @param args Arguments dictionary
   */
  async callTool(prefixedToolName: string, args: Record<string, any>): Promise<{ success: boolean; content: string }> {
    try {
      // Split the prefix back into server_id and tool_name
      // Assumes format: serverId___toolName
      const parts = prefixedToolName.split('___');
      if (parts.length < 2) {
        throw new Error(`Invalid prefixed tool name: ${prefixedToolName}`);
      }
      const server_id = parts[0];
      const tool_name = parts.slice(1).join('___'); // in case tool name has ___ in it natively

      const res = await fetch(`${MCP_API_URL}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id,
          tool_name,
          arguments: args,
        }),
      });
      
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(`Failed to call MCP tool ${prefixedToolName}:`, e);
      return { success: false, content: `Error: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
};
