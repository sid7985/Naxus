import type { Agent, AgentRole, ContextTab } from './types';

// ===== Agent Definitions =====

export const AGENT_COLORS: Record<AgentRole, string> = {
  manager: '#7C3AED',
  coder: '#06B6D4',
  designer: '#F59E0B',
  marketer: '#10B981',
  tester: '#F43F5E',
  researcher: '#6366F1',
};

export const AGENT_ICONS: Record<AgentRole, string> = {
  manager: 'Crown',
  coder: 'Code2',
  designer: 'Palette',
  marketer: 'Megaphone',
  tester: 'Bug',
  researcher: 'Search',
};

export const AGENT_SYSTEM_PROMPTS: Record<AgentRole, string> = {
  manager: `You are NEXUS Manager, the Founder's Right Hand. You are calm, decisive, and structured. When given a goal, break it into subtasks and specify which agent (coder, designer, marketer, researcher, tester) should handle each one. Format delegations as: "→ [AGENT_ROLE]: task description". Keep responses concise and actionable.`,
  coder: `You are NEXUS Coder, a Senior Engineer. You are precise and efficient. You write clean, production-quality code. Always explain your approach briefly, then provide the code. Supported: Python, Kotlin, JavaScript, TypeScript, Bash, Dart, Rust.`,
  designer: `You are NEXUS Designer, the UI/UX Lead. You are opinionated and aesthetic-first. Generate UI specs, component code, accessibility feedback, and design tokens. Use modern frameworks (SwiftUI, Jetpack Compose, React, CSS).`,
  marketer: `You are NEXUS Marketer, the Growth Lead. You are energetic and data-driven. Write compelling copy for app stores, social media, landing pages, email campaigns, and pitch decks. Always A/B test headlines.`,
  researcher: `You are NEXUS Researcher, the Intelligence Lead. You are thorough and citation-obsessed. Synthesize findings into structured reports. Cite sources. Compare alternatives with pros/cons tables.`,
  tester: `You are NEXUS Tester, the QA Lead. You are adversarial and methodical. Generate test plans, identify edge cases, write test scripts, and produce bug reports with clear reproduction steps.`,
};

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-manager',
    name: 'Manager',
    role: 'manager',
    color: AGENT_COLORS.manager,
    icon: AGENT_ICONS.manager,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 30, detail: 60 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: "The Founder's Right Hand — delegates tasks, monitors progress, generates mission briefs.",
  },
  {
    id: 'agent-coder',
    name: 'Coder',
    role: 'coder',
    color: AGENT_COLORS.coder,
    icon: AGENT_ICONS.coder,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 20, detail: 40 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: 'Senior Engineer — writes code, runs terminal, manages git, debugs autonomously.',
  },
  {
    id: 'agent-designer',
    name: 'Designer',
    role: 'designer',
    color: AGENT_COLORS.designer,
    icon: AGENT_ICONS.designer,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 50, detail: 70 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: 'UI/UX Lead — generates specs, component code, accessibility audits, design tokens.',
  },
  {
    id: 'agent-marketer',
    name: 'Marketer',
    role: 'marketer',
    color: AGENT_COLORS.marketer,
    icon: AGENT_ICONS.marketer,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 70, detail: 60 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: 'Growth Lead — writes copy, ASO, social posts, blog articles, pitch decks.',
  },
  {
    id: 'agent-researcher',
    name: 'Researcher',
    role: 'researcher',
    color: AGENT_COLORS.researcher,
    icon: AGENT_ICONS.researcher,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 30, detail: 80 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: 'Intelligence Lead — web search, deep research, document analysis, citations.',
  },
  {
    id: 'agent-tester',
    name: 'Tester',
    role: 'tester',
    color: AGENT_COLORS.tester,
    icon: AGENT_ICONS.tester,
    model: 'llama3.2:latest',
    status: 'idle',
    personality: { tone: 20, detail: 70 },
    metrics: { tokensUsed: 0, tasksCompleted: 0, totalExecutionTimeMs: 0, errorCount: 0 },
    description: 'QA Lead — adversarial testing, auto-generated bug reports, desktop control.',
  },
];

// ===== Context Panel Tabs =====

export const CONTEXT_TABS: ContextTab[] = [
  { id: 'files', label: 'Files', icon: 'FolderOpen' },
  { id: 'memory', label: 'Memory', icon: 'Brain' },
  { id: 'web', label: 'Web', icon: 'Globe' },
  { id: 'metrics', label: 'Metrics', icon: 'BarChart3' },
];

// ===== Keyboard Shortcuts =====

export const SHORTCUTS = {
  commandBar: 'Meta+Space',
  screenAnalysis: 'Meta+Shift+V',
  zeroClaw: 'Meta+Shift+Z',
  activateTester: 'Meta+Shift+T',
  openMemory: 'Meta+Shift+M',
  toggleInternet: 'Meta+Shift+I',
  newMission: 'Meta+Shift+A',
  pauseAgents: 'Meta+Shift+P',
  resumeAgents: 'Meta+Shift+R',
  emergencyStop: 'Ctrl+Shift+Escape',
  observability: 'Meta+Shift+L',
  codeEditor: 'Meta+Shift+E',
  cycleAgents: 'Meta+.',
  voiceToggle: 'Meta+/',
} as const;

// ===== Ollama Config =====

export const OLLAMA_BASE_URL = 'http://localhost:11434';
export const OLLAMA_API = {
  tags: `${OLLAMA_BASE_URL}/api/tags`,
  chat: `${OLLAMA_BASE_URL}/api/chat`,
  generate: `${OLLAMA_BASE_URL}/api/generate`,
  pull: `${OLLAMA_BASE_URL}/api/pull`,
} as const;

// ===== App Config =====

export const APP_NAME = 'NEXUS';
export const APP_VERSION = '0.1.0-alpha';
export const APP_TAGLINE = 'Your AI Company';
export const APP_SUBTITLE = 'Six agents. One machine. Zero cloud.';
