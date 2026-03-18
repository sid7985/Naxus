// ===== NEXUS Core Types =====

export type AgentRole = 'manager' | 'coder' | 'designer' | 'marketer' | 'researcher' | 'tester';

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'done' | 'error';

export type InternetMode = 'offline' | 'supervised' | 'researcher-only' | 'online';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  color: string;
  icon: string;
  model: string;
  status: AgentStatus;
  personality: {
    tone: number;     // 0 = Professional, 100 = Casual
    detail: number;   // 0 = Concise, 100 = Verbose
  };
  metrics: {
    tokensUsed: number;
    tasksCompleted: number;
    totalExecutionTimeMs: number;
    errorCount: number;
  };
  description: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string;
  agentRole?: AgentRole;
  timestamp: number;
  isStreaming?: boolean;
}

export interface AgentMessage extends Message {
  fromAgent: string;
  toAgent?: string;
  type: 'chat' | 'delegation' | 'result' | 'action' | 'approval';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'briefing' | 'active' | 'paused' | 'completed' | 'failed';
  agents: AgentRole[];
  tasks: MissionTask[];
  createdAt: number;
  updatedAt: number;
}

export interface MissionTask {
  id: string;
  title: string;
  assignedTo: AgentRole;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  dependencies: string[];
  result?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface WorkspaceConfig {
  projectName: string;
  workspacePath: string;
  modelAssignments: Record<AgentRole, string>;
  visionModel: string;
  isSetupComplete: boolean;
}

export interface ContextTab {
  id: 'files' | 'memory' | 'web' | 'metrics';
  label: string;
  icon: string;
}
