// ===== NEXUS Agent Orchestrator =====
// Routes messages between agents, handles delegation, and manages mission execution.

import { ollama } from './ollama';
import { chatWithProvider } from './llmProvider';
import { tauri } from './tauri';
import { memoryService } from './memory';
import { proxyClient } from './network/proxyClient';
import { mcpClient } from './mcpClient'; // NEW: Import mcpClient
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { AGENT_SYSTEM_PROMPTS } from '../lib/constants';
import { CODER_TOOLS, RESEARCHER_TOOLS } from '../agents/tools'; // FIXED Import
import type { AgentRole } from '../lib/types';

interface DelegationTask {
  id: string;
  description: string;
  assignedTo: AgentRole;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
}

// AGENT_SYSTEM_PROMPTS is now imported from '../lib/constants'

// RESEARCHER_TOOLS is now imported from '../lib/tools' - REMOVED from here

export class AgentOrchestrator {
  private abortController: AbortController | null = null;

  /** Parse Manager's delegation output into tasks */
  parseDelegations(managerResponse: string): DelegationTask[] {
    const tasks: DelegationTask[] = [];
    const lines = managerResponse.split('\n');
    
    for (const line of lines) {
      // Match patterns like "→ CODER: do something" or "→ [CODER]: do something"
      const match = line.match(/→\s*\[?(\w+)\]?:\s*(.+)/i);
      if (match) {
        const role = match[1].toLowerCase() as AgentRole;
        const validRoles: AgentRole[] = ['manager', 'coder', 'designer', 'marketer', 'researcher', 'tester'];
        if (validRoles.includes(role)) {
          tasks.push({
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            description: match[2].trim(),
            assignedTo: role,
            status: 'pending',
          });
        }
      }
    }
    return tasks;
  }

  /** Execute a full mission: user prompt → Manager plan → Agent delegation → results */
  async executeMission(userPrompt: string): Promise<void> {
    const store = useAgentStore.getState();
    const settings = useSettingsStore.getState();
    this.abortController = new AbortController();

    // Step 1: Manager creates plan
    store.updateAgentStatus('agent-manager', 'thinking');
    store.addMissionFeedMessage({
      role: 'system',
      content: `🎯 **New Mission Initiated**\n> ${userPrompt}`,
    });

    let managerPlan = '';
    store.addMissionFeedMessage({
      role: 'assistant',
      content: '▋',
      agentId: 'agent-manager',
      agentRole: 'manager',
      isStreaming: true,
    });

    try {
      for await (const token of ollama.chat(
        settings.workspace.modelAssignments.manager,
        [{ role: 'user', content: `The Founder has given this directive: "${userPrompt}"\n\nBreak this into specific subtasks and delegate to your team. Use the format:\n→ [AGENT_ROLE]: task description\n\nAvailable agents: CODER, DESIGNER, MARKETER, RESEARCHER, TESTER.\nAfter listing delegations, provide a brief mission summary.` }],
        AGENT_SYSTEM_PROMPTS.manager
      )) {
        if (this.abortController?.signal.aborted) break;
        managerPlan += token;
        this._updateLastFeedMessage(managerPlan);
      }
      this._finalizeLastFeedMessage(managerPlan);
      store.updateAgentStatus('agent-manager', 'idle');
    } catch (error) {
      store.addMissionFeedMessage({
        role: 'assistant',
        content: `⚠️ Manager error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        agentId: 'agent-manager',
        agentRole: 'manager',
      });
      store.updateAgentStatus('agent-manager', 'error');
      return;
    }

    // Step 2: Parse delegations
    const tasks = this.parseDelegations(managerPlan);
    if (tasks.length === 0) {
      // No delegations — Manager handled it directly
      return;
    }

    store.addMissionFeedMessage({
      role: 'system',
      content: `📋 **Mission Plan**: ${tasks.length} task(s) delegated\n${tasks.map((t, i) => `${i + 1}. **${t.assignedTo.toUpperCase()}** — ${t.description}`).join('\n')}`,
    });

    // Step 3: Execute each delegated task sequentially
    for (const task of tasks) {
      if (this.abortController?.signal.aborted) break;

      const agentId = `agent-${task.assignedTo}`;
      store.updateAgentStatus(agentId, 'thinking');

      store.addMissionFeedMessage({
        role: 'system',
        content: `⚡ **${task.assignedTo.toUpperCase()}** is working on: *${task.description}*`,
      });

      let agentResponse = '';
      store.addMissionFeedMessage({
        role: 'assistant',
        content: '▋',
        agentId,
        agentRole: task.assignedTo,
        isStreaming: true,
      });

      try {
        let tools: any = undefined;
        let baseTools: any[] = [];
        
        if (task.assignedTo === 'coder') baseTools = [...CODER_TOOLS];
        if (task.assignedTo === 'researcher') baseTools = [...RESEARCHER_TOOLS];
        
        // Dynamically fetch MCP tools
        try {
          const mcpToolsList = await mcpClient.getAllTools();
          const mcpMapped = mcpToolsList.map(t => ({
            type: 'function',
            function: {
              name: t.name, // The prefixed name (e.g. mcp-fs___read_file)
              description: t.description,
              parameters: t.parameters || { type: 'object', properties: {} }
            }
          }));
          
          if (mcpMapped.length > 0) {
            baseTools = [...baseTools, ...mcpMapped];
          }
        } catch (e) {
          console.warn('Failed to fetch MCP tools:', e);
        }
        
        if (baseTools.length > 0) tools = baseTools;
        
        const localMemoryContext = await memoryService.getContextForAgent(`agent-${task.assignedTo}`);
        
        let semanticMemoryContext = '';
        try {
          // Mem0 Semantic Memory Injection
          const semRes = await memoryService.searchSemantic(task.description);
          if (semRes?.success && semRes.results?.length > 0) {
            semanticMemoryContext = `\n\n--- SEMANTIC PAST MEMORIES ---\n${semRes.results.map((r: any) => r.memory || r.text).join('\n---\n')}\n-----------------------------\n`;
          }
        } catch (e) {
          console.warn('Semantic memory query failed:', e);
        }

        let ragContext = '';
        try {
          const ragRes = await memoryService.queryKnowledgeBase(task.description, 3);
          if (ragRes?.success && ragRes.results?.length > 0) {
            ragContext = `\n\n--- KNOWLEDGE BASE (RAG) CONTEXT ---\n${ragRes.results.map((r: any) => r.content).join('\n---\n')}\n----------------------------------\n`;
          }
        } catch (e) {
          console.warn('RAG query failed:', e);
        }

        const fullSystemPrompt = AGENT_SYSTEM_PROMPTS[task.assignedTo] + localMemoryContext + semanticMemoryContext + ragContext;

        for await (const chunk of chatWithProvider(
          settings.workspace.modelAssignments[task.assignedTo],
          [{ role: 'user', content: `You have been assigned this task by the Manager:\n\n"${task.description}"\n\nComplete this task thoroughly. If it involves code, write files or execute commands. If it involves writing, provide the full content.` }],
          fullSystemPrompt,
          tools
        )) {
          if (this.abortController?.signal.aborted) break;
          
          if (typeof chunk === 'object' && chunk !== null && 'metrics' in chunk) {
            // Intercept telemetry
            store.incrementAgentMetrics(agentId, {
              tokensUsed: chunk.metrics.tokens,
              totalExecutionTimeMs: chunk.metrics.duration * 1000 // approx ms
            });
            continue;
          }
          
          if (typeof chunk === 'string') {
            agentResponse += chunk;
            this._updateLastFeedMessage(agentResponse);
          } else if (chunk.tool_calls) {
            store.updateAgentStatus(agentId, 'acting');
            for (const call of chunk.tool_calls) {
              const args = call.function.arguments;
              let resultText = `⚙️ Executing: ${call.function.name}(${JSON.stringify(args)})\n`;
              
              // NEW: Multi-Agent Debate Mode for Destructive Actions
              const destructiveTools = ['write_file', 'delete_file', 'execute_command', 'git_commit'];
              let debateRejected = false;

              if (destructiveTools.includes(call.function.name) && task.assignedTo !== 'tester') {
                store.addMissionFeedMessage({
                  role: 'system',
                  content: `🚨 **DEBATE PROTOCOL ACTIVATED**\nTESTER agent analyzing destructive action: \`${call.function.name}\``,
                });
                store.updateAgentStatus('agent-tester', 'thinking');
                
                let testerResponse = '';
                try {
                  const debatePrompt = `The ${task.assignedTo.toUpperCase()} agent wishes to execute a destructive or state-mutating action:\nTool: ${call.function.name}\nArgs: ${JSON.stringify(args)}\n\nYou are the Security/QA Tester. Analyze this action. If it looks perfectly safe (like running a standard build command or creating a standard file), explicitly say 'APPROVE'. If it looks dangerous, destructive without cause, or malformed, say 'REJECT' and give your reason. Keep it under 2 sentences.`;

                  for await (const tChunk of chatWithProvider(
                    settings.workspace.modelAssignments.tester || 'ollama:llama3.2',
                    [{ role: 'user', content: debatePrompt }],
                    AGENT_SYSTEM_PROMPTS.tester
                  )) {
                     if (this.abortController?.signal.aborted) break;
                     if (typeof tChunk === 'string') testerResponse += tChunk;
                  }
                  
                  store.addMissionFeedMessage({
                    role: 'assistant',
                    content: testerResponse,
                    agentId: 'agent-tester',
                    agentRole: 'tester',
                  });

                  if (testerResponse.includes('REJECT') || testerResponse.includes('REJECTED')) {
                    debateRejected = true;
                    resultText = `❌ Action blocked by TESTER Agent consensus.\nReason: ${testerResponse}`;
                    store.incrementAgentMetrics(agentId, { errorCount: 1 });
                  } else {
                    resultText = `⚖️ TESTER approved action. Proceeding...\n` + resultText;
                  }
                } catch (e) {
                  resultText += `\n⚠️ Trial skipped (Tester offline). Assuming implicit approval.\n`;
                }
                store.updateAgentStatus('agent-tester', 'idle');
              }

              if (debateRejected) {
                store.addMissionFeedMessage({
                  role: 'system',
                  content: resultText,
                  agentId: agentId,
                  agentRole: task.assignedTo,
                });
                continue; // Skip the tool execution inside the try/catch
              }

              try {
                if (call.function.name === 'read_file') {
                  const content = await tauri.readFile(args.path);
                  resultText += `✅ File read successfully:\n\`\`\`\n${content.substring(0, 500)}...\n\`\`\``;
                } else if (call.function.name === 'write_file') {
                  await tauri.writeFile(args.path, args.content);
                  resultText += `✅ File written successfully to ${args.path}`;
                } else if (call.function.name === 'delete_file') {
                  await tauri.deleteFile(args.path);
                  resultText += `✅ File deleted successfully: ${args.path}`;
                } else if (call.function.name === 'execute_command') {
                  const res = await tauri.executeCommand(args.cmd, args.cwd);
                  resultText += res.success ? `✅ Output:\n${res.stdout}` : `❌ Error:\n${res.stderr}`;
                } else if (call.function.name === 'list_directory') {
                  const files = await tauri.listDirectory(args.path, args.max_depth || 1);
                  resultText += `✅ Directory listing (${files.length} items):\n${files.map((f: any) => `${f.is_dir ? '📁' : '📄'} ${f.name}`).join('\n')}`;
                } else if (call.function.name === 'search_files') {
                  const results = await tauri.searchFiles(args.query, args.path);
                  resultText += `✅ Found ${results.length} results.\n${results.slice(0, 5).map((r: any) => `${r.path}:${r.line_number}`).join('\n')}`;
                } else if (call.function.name === 'get_system_info') {
                  const info = await tauri.getSystemInfo();
                  resultText += `✅ System Info:\nOS: ${info.os}\nArch: ${info.arch}\nCores: ${info.cpu_cores}\nHost: ${info.hostname}`;
                } else if (call.function.name === 'git_status') {
                  const status = await tauri.gitStatus(args.repo_path);
                  resultText += `✅ Git Status: ${status.branch}\nStaged: ${status.staged.length}, Modified: ${status.modified.length}`;
                } else if (call.function.name === 'git_commit') {
                  const out = await tauri.gitCommit(args.repo_path, args.message);
                  resultText += `✅ Commit successful:\n${out}`;
                } else if (call.function.name === 'web_search_proxy') {
                  // Direct DuckDuckGo HTML search proxy mapping
                  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(args.query)}`;
                  const res = await proxyClient.fetch({ url: searchUrl, agent_id: agentId });
                  if (res.success && res.content) {
                    // Quick regex extract to save context boundary
                    const links = [...res.content.matchAll(/class="result__url" href="([^"]+)"/g)].slice(0, 5).map(m => m[1]);
                    resultText += `✅ Searched Proxy successfully. Top 5 extracted URLs:\n${links.join('\n')}`;
                  } else {
                    resultText += `❌ Proxy blocked or failed: ${res.reason || res.error}`;
                  }
                } else if (call.function.name === 'web_scrape_playwright') {
                  const scrapeRes = await fetch('http://localhost:1421/network/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: args.url })
                  });
                  if (scrapeRes.ok) {
                    const data = await scrapeRes.json();
                    resultText += data.success 
                      ? `✅ Scraped Page Markdown (trimmed):\n\`\`\`\n${data.markdown.substring(0, 2000)}...\n\`\`\`` 
                      : `❌ Scrape failed.`;
                  } else {
                    resultText += `❌ Headless Scraper Error: HTTP ${scrapeRes.status}`;
                  }
                } else if (call.function.name.includes('___')) { // NEW: Handle MCP tools
                  // This is an MCP tool
                  const mcpRes = await mcpClient.callTool(call.function.name, args);
                  if (mcpRes.success) {
                    resultText += `✅ MCP Tool Success:\n\`\`\`\n${mcpRes.content.substring(0, 2000)}${mcpRes.content.length > 2000 ? '...' : ''}\n\`\`\``;
                  } else {
                    resultText += `❌ MCP Tool Error:\n${mcpRes.content}`;
                  }
                } else {
                  resultText += `❌ Unknown tool requested: ${call.function.name}`;
                  store.incrementAgentMetrics(agentId, { errorCount: 1 });
                }
              } catch (err: any) {
                resultText += `❌ Tool failed: ${err.message || String(err)}`;
                store.incrementAgentMetrics(agentId, { errorCount: 1 });
              }

              store.addMissionFeedMessage({
                role: 'system',
                content: resultText,
                agentId: agentId,
                agentRole: task.assignedTo,
              });
            }
            store.updateAgentStatus(agentId, 'thinking');
          }
        }
        this._finalizeLastFeedMessage(agentResponse);
        task.status = 'completed';
        task.result = agentResponse;
        store.updateAgentStatus(agentId, 'done');
        store.incrementAgentMetrics(agentId, { tasksCompleted: 1 });

        // Brief delay between agents for visual clarity
        await new Promise((r) => setTimeout(r, 500));
        store.updateAgentStatus(agentId, 'idle');
      } catch (error) {
        task.status = 'failed';
        store.addMissionFeedMessage({
          role: 'assistant',
          content: `⚠️ ${task.assignedTo} error: ${error instanceof Error ? error.message : 'Failed'}`,
          agentId,
          agentRole: task.assignedTo,
        });
        store.updateAgentStatus(agentId, 'error');
        store.incrementAgentMetrics(agentId, { errorCount: 1 });
      }
    }

    // Step 4: Mission complete summary
    const completed = tasks.filter((t) => t.status === 'completed').length;
    store.addMissionFeedMessage({
      role: 'system',
      content: `✅ **Mission Complete** — ${completed}/${tasks.length} tasks finished successfully.`,
    });
  }

  /** Stop all agent execution */
  abort() {
    this.abortController?.abort();
    const store = useAgentStore.getState();
    store.agents.forEach((a) => store.updateAgentStatus(a.id, 'idle'));
    store.addMissionFeedMessage({
      role: 'system',
      content: '🛑 **Emergency Stop** — All agents paused.',
    });
  }

  /** Chat with a single agent (used in Agent Profile) */
  async *chatWithAgent(
    agentRole: AgentRole,
    messages: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown> {
    const settings = useSettingsStore.getState();
    const model = settings.workspace.modelAssignments[agentRole];
    const memoryContext = await memoryService.getContextForAgent(`agent-${agentRole}`);
    
    let ragContext = '';
    try {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        const ragRes = await memoryService.queryKnowledgeBase(lastUserMessage.content, 3);
        if (ragRes?.success && ragRes.results?.length > 0) {
          ragContext = `\n\n--- KNOWLEDGE BASE (RAG) CONTEXT ---\n${ragRes.results.map((r: any) => r.content).join('\n---\n')}\n----------------------------------\n`;
        }
      }
    } catch (e) {
      console.warn('RAG query failed:', e);
    }

    const fullSystemPrompt = AGENT_SYSTEM_PROMPTS[agentRole] + memoryContext + ragContext;

    for await (const chunk of ollama.chat(model, messages, fullSystemPrompt)) {
      if (typeof chunk === 'string') {
        yield chunk;
      }
    }
  }

  private _updateLastFeedMessage(content: string) {
    useAgentStore.setState((state) => {
      const feed = [...state.missionFeed];
      if (feed.length > 0) {
        feed[feed.length - 1] = { ...feed[feed.length - 1], content };
      }
      return { missionFeed: feed };
    });
  }

  private _finalizeLastFeedMessage(content: string) {
    useAgentStore.setState((state) => {
      const feed = [...state.missionFeed];
      if (feed.length > 0) {
        feed[feed.length - 1] = { ...feed[feed.length - 1], content, isStreaming: false };
      }
      return { missionFeed: feed };
    });
  }
}

// Singleton
export const orchestrator = new AgentOrchestrator();
