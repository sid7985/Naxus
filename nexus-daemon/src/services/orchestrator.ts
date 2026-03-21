import { ollamaService, AgentMessage } from './ollamaService';
import { mcpBridge } from './mcpBridge';
import { workflowDeployer } from './workflowDeployer';

export interface OrchestrationResult {
  logs: string[];
  finalResponse: string;
}

export class Orchestrator {
  
  async handleTask(userPrompt: string): Promise<OrchestrationResult> {
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };
    
    log(`[Orchestrator] Task Received: "${userPrompt}"`);
    
    // 1. Planning Phase using Ollama
    log(`[Orchestrator] Generating execution plan via Ollama (Model Context Protocol simulation)...`);
    let planJsonStr = '';
    try {
      planJsonStr = await ollamaService.generatePlan(userPrompt);
      log(`[Orchestrator] Raw Plan: ${planJsonStr}`);
    } catch (e: any) {
      log(`[Orchestrator] Error generating plan: ${e.message}`);
      return { logs, finalResponse: "Failed during planning phase." };
    }

    // 2. Parse the plan
    let actions: any[] = [];
    try {
      // Sometimes Ollama might return Markdown wrapped JSON.
      const cleaned = planJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      actions = JSON.parse(cleaned);
      if (!Array.isArray(actions)) {
         // Some models output a single object instead of array
         actions = [actions];
      }
    } catch (e) {
      log(`[Orchestrator] Failed to parse JSON plan from LLM. Output wasn't strict JSON.`);
      return { logs, finalResponse: "I couldn't formate a standardized execution plan." };
    }

    // 3. Execution Phase Loop
    for (let action of actions) {
      const toolName = action.tool;
      log(`[Orchestrator] Executing Tool -> [${toolName}]`);
      
      try {
        if (toolName === 'deploy_n8n_workflow') {
           const flowName = action.workflow_name || 'GeneratedFlow';
           const endpoint = action.endpoint || '/nexus-trigger';
           const targetUrl = action.targetUrl || 'http://example.com/api';
           
           log(`[Orchestrator] Generating n8n workflow topology...`);
           const workflowJson = workflowDeployer.generateWebhookToHttpFlow(flowName, endpoint, targetUrl);
           const result = await workflowDeployer.deployToN8n(workflowJson);
           log(`[Orchestrator] Result: ${result}`);
           
        } else {
           // Standard MCP local tool bridging
           const result = await mcpBridge.invokeTool(toolName, action);
           log(`[Orchestrator] Tool output length: ${String(result).length} chars`);
           log(`[Orchestrator] Raw snippet: ${String(result).substring(0, 100).replace(/\n/g,' ')}...`);
        }
      } catch (err: any) {
         log(`[Orchestrator] Tool execution error: ${err.message}`);
      }
    }
    
    log(`[Orchestrator] Execution cycle complete.`);
    return {
      logs,
      finalResponse: `Task finished. Executed ${actions.length} tools.`
    };
  }

}

export const orchestrator = new Orchestrator();
