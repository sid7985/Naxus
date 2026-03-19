import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkspaceConfig, AgentRole, InternetMode } from '../lib/types';
import type { LLMProviderId } from '../services/llmProvider';

interface SettingsState {
  workspace: WorkspaceConfig;
  theme: 'dark' | 'oled' | 'light' | 'high-contrast';
  internetMode: InternetMode;
  ollamaConnected: boolean;
  liquidGlassEnabled: boolean;
  allowedDomains: string[];
  providerApiKeys: Partial<Record<LLMProviderId, string>>;
  providerBaseUrls: Partial<Record<LLMProviderId, string>>;

  // Actions
  setWorkspace: (config: Partial<WorkspaceConfig>) => void;
  setTheme: (theme: SettingsState['theme']) => void;
  setLiquidGlassEnabled: (enabled: boolean) => void;
  setInternetMode: (mode: InternetMode) => void;
  setOllamaConnected: (connected: boolean) => void;
  setSetupComplete: (complete: boolean) => void;
  setModelAssignment: (role: AgentRole, model: string) => void;
  addAllowedDomain: (domain: string) => void;
  removeAllowedDomain: (domain: string) => void;
  setProviderApiKey: (provider: LLMProviderId, key: string) => void;
  setProviderBaseUrl: (provider: LLMProviderId, url: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      workspace: {
        projectName: '',
        workspacePath: '',
        modelAssignments: {
          manager: 'llama3.2:latest',
          coder: 'llama3.2:latest',
          designer: 'llama3.2:latest',
          marketer: 'llama3.2:latest',
          researcher: 'llama3.2:latest',
          tester: 'llama3.2:latest',
        },
        visionModel: 'llama3.2-vision:latest',
        isSetupComplete: false,
      },
      theme: 'dark',
      liquidGlassEnabled: false,
      internetMode: 'offline',
      ollamaConnected: false,
      allowedDomains: [],
      providerApiKeys: {},
      providerBaseUrls: {},

      setWorkspace: (config) =>
        set((state) => ({
          workspace: { ...state.workspace, ...config },
        })),

      setTheme: (theme) => set({ theme }),
      setLiquidGlassEnabled: (enabled) => set({ liquidGlassEnabled: enabled }),
      setInternetMode: (mode) => set({ internetMode: mode }),
      setOllamaConnected: (connected) => set({ ollamaConnected: connected }),

      setSetupComplete: (complete) =>
        set((state) => ({
          workspace: { ...state.workspace, isSetupComplete: complete },
        })),

      setModelAssignment: (role, model) =>
        set((state) => ({
          workspace: {
            ...state.workspace,
            modelAssignments: {
              ...state.workspace.modelAssignments,
              [role]: model,
            },
          },
        })),

      addAllowedDomain: (domain) =>
        set((state) => ({
          allowedDomains: state.allowedDomains.includes(domain)
            ? state.allowedDomains
            : [...state.allowedDomains, domain],
        })),

      removeAllowedDomain: (domain) =>
        set((state) => ({
          allowedDomains: state.allowedDomains.filter((d) => d !== domain),
        })),

      setProviderApiKey: (provider, key) =>
        set((state) => ({
          providerApiKeys: { ...state.providerApiKeys, [provider]: key },
        })),

      setProviderBaseUrl: (provider, url) =>
        set((state) => ({
          providerBaseUrls: { ...state.providerBaseUrls, [provider]: url },
        })),
    }),
    {
      name: 'nexus-settings',
    }
  )
);
