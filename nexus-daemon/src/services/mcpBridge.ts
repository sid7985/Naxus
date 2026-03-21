import { sandboxService } from './sandboxService';
import fs from 'fs/promises';
import path from 'path';

/**
 * Minimum implementation of the Model Context Protocol (MCP) bridging logic.
 * Inspired by OpenCode, this exposes local machine resources as discrete tools
 * that the LLM Orchestrator can call intelligently.
 */
export class MCPBridge {
  
  async invokeTool(toolName: string, args: Record<string, any>): Promise<string> {
    console.log(`[MCPBridge] Invoked Tool: ${toolName}`, args);
    
    switch (toolName) {
      case 'execute_bash':
        if (!args.command) return "Missing 'command' argument";
        return await sandboxService.executeBash(args.command);
        
      case 'read_file':
        if (!args.path) return "Missing 'path' argument";
        try {
          const content = await fs.readFile(path.resolve(args.path), 'utf-8');
          return content;
        } catch (e: any) {
          return `Error reading file: ${e.message}`;
        }
        
      case 'list_directory':
        if (!args.path) return "Missing 'path' argument";
        try {
          const files = await fs.readdir(path.resolve(args.path));
          return files.join('\n');
        } catch(e: any) {
          return `Error listing dir: ${e.message}`;
        }
        
      default:
        return `Unknown tool: ${toolName}`;
    }
  }

}

export const mcpBridge = new MCPBridge();
