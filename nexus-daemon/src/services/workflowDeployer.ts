import axios from 'axios';

/**
 * Automates the deployment of complex data flows. 
 * Instead of writing raw API scripts, the NEXUS Auto-Orchestrator generates
 * JSON workflows and pushes them directly to n8n.
 */
export class WorkflowDeployer {
  private n8nBaseUrl = process.env.N8N_LOCAL_URL || 'http://localhost:5678';
  private n8nApiKey = process.env.N8N_API_KEY || ''; // Usually required for n8n API

  /**
   * Generates a basic n8n workflow JSON structure dynamically.
   */
  generateWebhookToHttpFlow(name: string, endpoint: string, targetUrl: string): any {
    return {
      "name": `NEXUS Auto - ${name}`,
      "nodes": [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": endpoint.replace(/^\//, ''),
            "options": {}
          },
          "name": "Webhook Trigger",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [ 250, 300 ],
          "webhookId": `nexus-auto-${Date.now()}`
        },
        {
          "parameters": {
            "requestMethod": "POST",
            "url": targetUrl,
            "jsonParameters": true,
            "options": {}
          },
          "name": "Target API",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 2,
          "position": [ 450, 300 ]
        }
      ],
      "connections": {
        "Webhook Trigger": {
          "main": [
            [
              {
                "node": "Target API",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      "active": false,
      "settings": {},
      "tags": []
    };
  }

  /**
   * Pushes a constructed workflow JSON to n8n via its REST API.
   */
  async deployToN8n(workflowJson: any): Promise<string> {
    try {
        console.log(`[WorkflowDeployer] Attempting to deploy '${workflowJson.name}' to n8n at ${this.n8nBaseUrl}...`);
        
        // Ensure standard headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (this.n8nApiKey) headers['X-N8N-API-KEY'] = this.n8nApiKey;

        const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows`, workflowJson, {
            headers,
            timeout: 5000 // 5 seconds
        });

        const id = response.data.id;
        console.log(`[WorkflowDeployer] Successfully deployed workflow. ID: ${id}`);
        return `Successfully drafted and deployed n8n workflow. Workflow ID: ${id}`;
        
    } catch (e: any) {
        console.error('[WorkflowDeployer] n8n Deployment Failed:', e.message);
        return `Failed to deploy workflow to n8n: ${e.message}. Is n8n running on ${this.n8nBaseUrl}?`;
    }
  }

}

export const workflowDeployer = new WorkflowDeployer();
