import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSettingsStore } from './stores/settingsStore';
import ErrorBoundary from './components/layout/ErrorBoundary';
import CommandPalette from './components/ui/CommandPalette';
import ToastContainer from './components/ui/ToastContainer';
import AsyncTrayIndicator from './components/ui/AsyncTrayIndicator';
import Breadcrumb from './components/ui/Breadcrumb';
import NotificationCenter from './components/ui/NotificationCenter';
import './styles/themes.css';
import './services/missionQueue'; // Initialize background tasks

// Lazy-loaded pages (code splitting)
const LauncherPage = lazy(() => import('./pages/LauncherPage'));
const LaunchSelectionPage = lazy(() => import('./pages/LaunchSelectionPage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const AgentProfilePage = lazy(() => import('./pages/AgentProfilePage'));
const MissionBuilderPage = lazy(() => import('./pages/MissionBuilderPage'));
const CodeEditorPage = lazy(() => import('./pages/CodeEditorPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ObservabilityPage = lazy(() => import('./pages/ObservabilityPage'));
const MemoryPage = lazy(() => import('./pages/MemoryPage'));
const MemoryGraphPage = lazy(() => import('./pages/MemoryGraphPage'));
const QuickTodoPage = lazy(() => import('./pages/QuickTodoPage'));
const ComputerModePage = lazy(() => import('./pages/ComputerModePage'));
const RPGWorldPage = lazy(() => import('./pages/RPGWorldPage'));
const AgentCreatorPage = lazy(() => import('./pages/AgentCreatorPage'));
const ProjectManagerPage = lazy(() => import('./pages/ProjectManagerPage'));
const ScreenVisionPage = lazy(() => import('./pages/ScreenVisionPage'));
const TesterConsolePage = lazy(() => import('./pages/TesterConsolePage'));
const ZeroClawPage = lazy(() => import('./pages/ZeroClawPage'));
const PluginManagerPage = lazy(() => import('./pages/PluginManagerPage'));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const VoiceControlPage = lazy(() => import('./pages/VoiceControlPage'));
const InternetControlPage = lazy(() => import('./pages/InternetControlPage'));
const GlobalSearchPage = lazy(() => import('./pages/GlobalSearchPage'));
const GitPanelPage = lazy(() => import('./pages/GitPanelPage'));
const KeyboardShortcutsPage = lazy(() => import('./pages/KeyboardShortcutsPage'));

// Loading fallback
function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-agent-manager/10 border border-agent-manager/20 flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 rounded-full bg-agent-manager/40" />
        </div>
        <span className="text-xs text-text-muted font-mono">Loading...</span>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);

  return (
    <div className={`h-full w-full ${liquidGlassEnabled ? 'bg-transparent' : 'bg-void nebula-bg'}`} data-theme={theme}>
      <CommandPalette />
      <ToastContainer />
      <AsyncTrayIndicator />
      <div className="flex items-center justify-between border-b border-glass-border/20">
        <Breadcrumb />
        <div className="pr-3">
          <NotificationCenter />
        </div>
      </div>
      {children}
    </div>
  );
}

function GlobalRPGListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSetupComplete = useSettingsStore((state) => state.workspace.isSetupComplete);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSetupComplete && e.key !== 'k') return;

      if (e.metaKey && e.key === 'g') {
        e.preventDefault();
        if (location.pathname === '/rpg') navigate('/');
        else navigate('/rpg');
      }
      if (e.metaKey && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }
      if (e.metaKey && e.key === '1') {
        e.preventDefault();
        navigate('/command');
      }
      if (e.metaKey && e.key === '2') {
        e.preventDefault();
        navigate('/editor');
      }
      if (e.metaKey && e.key === '3') {
        e.preventDefault();
        navigate('/memory');
      }
      if (e.metaKey && e.key === '4') {
        e.preventDefault();
        navigate('/observability');
      }
      if (e.metaKey && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, isSetupComplete]);

  return null;
}

export default function App() {
  const isSetupComplete = useSettingsStore((state) => state.workspace.isSetupComplete);

  return (
    <BrowserRouter>
      <GlobalRPGListener />
      <AppShell>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
        <Routes>
          <Route path="/launcher" element={<LauncherPage />} />

          <Route path="/" element={isSetupComplete ? <LaunchSelectionPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/command" element={isSetupComplete ? <CommandCenterPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/agent/:agentId" element={isSetupComplete ? <AgentProfilePage /> : <Navigate to="/launcher" replace />} />
          <Route path="/mission/new" element={isSetupComplete ? <MissionBuilderPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/editor" element={isSetupComplete ? <CodeEditorPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/settings" element={isSetupComplete ? <SettingsPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/observability" element={isSetupComplete ? <ObservabilityPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/memory" element={isSetupComplete ? <MemoryPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/memory-graph" element={isSetupComplete ? <MemoryGraphPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/todo" element={isSetupComplete ? <QuickTodoPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/computer" element={isSetupComplete ? <ComputerModePage /> : <Navigate to="/launcher" replace />} />
          <Route path="/rpg" element={isSetupComplete ? <RPGWorldPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/agent/create" element={isSetupComplete ? <AgentCreatorPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/projects" element={isSetupComplete ? <ProjectManagerPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/vision" element={isSetupComplete ? <ScreenVisionPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/tester" element={isSetupComplete ? <TesterConsolePage /> : <Navigate to="/launcher" replace />} />
          <Route path="/zeroclaw" element={isSetupComplete ? <ZeroClawPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/plugins" element={isSetupComplete ? <PluginManagerPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/voice" element={isSetupComplete ? <VoiceControlPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/internet" element={isSetupComplete ? <InternetControlPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/workflows" element={isSetupComplete ? <WorkflowPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/integrations" element={isSetupComplete ? <IntegrationsPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/search" element={isSetupComplete ? <GlobalSearchPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/git" element={isSetupComplete ? <GitPanelPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/shortcuts" element={isSetupComplete ? <KeyboardShortcutsPage /> : <Navigate to="/launcher" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AnimatePresence>
        </Suspense>
        </ErrorBoundary>
      </AppShell>
    </BrowserRouter>
  );
}
