import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import ErrorBoundary from './components/layout/ErrorBoundary';
import CommandPalette from './components/ui/CommandPalette';
import ToastContainer from './components/ui/ToastContainer';
import AsyncTrayIndicator from './components/ui/AsyncTrayIndicator';
import MenuBar from './components/layout/MenuBar';
import ActivityBar from './components/layout/ActivityBar';
import StatusBar from './components/layout/StatusBar';
import Sidebar from './components/layout/Sidebar';
import BottomPanel from './components/layout/BottomPanel';
import './styles/themes.css';
import './services/missionQueue'; // Initialize background tasks

// Lazy-loaded pages (code splitting)
const CloudEnginePage = lazy(() => import('./pages/CloudEnginePage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const AgentProfilePage = lazy(() => import('./pages/AgentProfilePage'));
const MissionBuilderPage = lazy(() => import('./pages/MissionBuilderPage'));
const CodeEditorPage = lazy(() => import('./pages/CodeEditorPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ObservabilityPage = lazy(() => import('./pages/ObservabilityPage'));
const MemoryPage = lazy(() => import('./pages/MemoryPage'));
const DocumentIntelligencePage = lazy(() => import('./pages/DocumentIntelligencePage'));
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

function FullscreenLayout({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);

  return (
    <div className={`h-full w-full ${liquidGlassEnabled ? 'bg-transparent' : ''}`} data-theme={theme} style={{ background: 'var(--bg-void)' }}>
      <CommandPalette />
      <ToastContainer />
      {children}
    </div>
  );
}

function MinimalLayout({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);

  return (
    <div className={`h-full w-full flex flex-col ${liquidGlassEnabled ? 'bg-transparent' : ''}`} data-theme={theme} style={{ background: 'var(--bg-void)' }}>
      <CommandPalette />
      <ToastContainer />
      <AsyncTrayIndicator />
      
      {/* Menu Bar Only */}
      <MenuBar />
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}

function IdeLayout({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const liquidGlassEnabled = useSettingsStore((s) => s.liquidGlassEnabled);

  return (
    <div className={`h-full w-full flex flex-col ${liquidGlassEnabled ? 'bg-transparent' : ''}`} data-theme={theme} style={{ background: 'var(--bg-void)' }}>
      <CommandPalette />
      <ToastContainer />
      <AsyncTrayIndicator />

      {/* Menu Bar */}
      <MenuBar />

      {/* Main Body: ActivityBar + Sidebar + Content + BottomPanel */}
      <div className="flex flex-1 min-h-0">
        <ActivityBar />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 overflow-auto">
            {children}
          </div>
          <BottomPanel />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

// Higher Order Component to decide layout based on route
function LayoutDecider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Fullscreen Routes
  if (['/'].includes(location.pathname)) {
    return <FullscreenLayout>{children}</FullscreenLayout>;
  }

  // IDE Routes (Theia inspired)
  const ideRoutes = ['/editor', '/search', '/git', '/plugins', '/tester', '/observability'];
  if (ideRoutes.some(route => location.pathname.startsWith(route))) {
    return <IdeLayout>{children}</IdeLayout>;
  }

  // Minimal Routes (Default for all others)
  return <MinimalLayout>{children}</MinimalLayout>;
}

function AnimatedRoutes() {
  const isSetupComplete = useSettingsStore((state) => state.workspace.isSetupComplete);
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<RPGWorldPage />} />
      <Route path="/rpg" element={<Navigate to="/" replace />} />

      <Route path="/cloud" element={isSetupComplete ? <CloudEnginePage /> : <Navigate to="/" replace />} />
      <Route path="/command" element={isSetupComplete ? <CommandCenterPage /> : <Navigate to="/" replace />} />
      <Route path="/agent/:agentId" element={isSetupComplete ? <AgentProfilePage /> : <Navigate to="/" replace />} />
      <Route path="/mission/new" element={isSetupComplete ? <MissionBuilderPage /> : <Navigate to="/" replace />} />
      <Route path="/editor" element={isSetupComplete ? <CodeEditorPage /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={isSetupComplete ? <SettingsPage /> : <Navigate to="/" replace />} />
      <Route path="/observability" element={isSetupComplete ? <ObservabilityPage /> : <Navigate to="/" replace />} />
      <Route path="/memory" element={isSetupComplete ? <MemoryPage /> : <Navigate to="/" replace />} />
      <Route path="/document-intelligence" element={isSetupComplete ? <DocumentIntelligencePage /> : <Navigate to="/" replace />} />
      <Route path="/memory-graph" element={isSetupComplete ? <MemoryGraphPage /> : <Navigate to="/" replace />} />
      <Route path="/todo" element={isSetupComplete ? <QuickTodoPage /> : <Navigate to="/" replace />} />
      <Route path="/computer" element={isSetupComplete ? <ComputerModePage /> : <Navigate to="/" replace />} />
      <Route path="/agent/create" element={isSetupComplete ? <AgentCreatorPage /> : <Navigate to="/" replace />} />
      <Route path="/projects" element={isSetupComplete ? <ProjectManagerPage /> : <Navigate to="/" replace />} />
      <Route path="/vision" element={isSetupComplete ? <ScreenVisionPage /> : <Navigate to="/" replace />} />
      <Route path="/tester" element={isSetupComplete ? <TesterConsolePage /> : <Navigate to="/" replace />} />
      <Route path="/zeroclaw" element={isSetupComplete ? <ZeroClawPage /> : <Navigate to="/" replace />} />
      <Route path="/plugins" element={isSetupComplete ? <PluginManagerPage /> : <Navigate to="/" replace />} />
      <Route path="/voice" element={isSetupComplete ? <VoiceControlPage /> : <Navigate to="/" replace />} />
      <Route path="/internet" element={isSetupComplete ? <InternetControlPage /> : <Navigate to="/" replace />} />
      <Route path="/workflows" element={isSetupComplete ? <WorkflowPage /> : <Navigate to="/" replace />} />
      <Route path="/integrations" element={isSetupComplete ? <IntegrationsPage /> : <Navigate to="/" replace />} />
      <Route path="/search" element={isSetupComplete ? <GlobalSearchPage /> : <Navigate to="/" replace />} />
      <Route path="/git" element={isSetupComplete ? <GitPanelPage /> : <Navigate to="/" replace />} />
      <Route path="/shortcuts" element={isSetupComplete ? <KeyboardShortcutsPage /> : <Navigate to="/" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
        navigate('/');
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
  return (
    <BrowserRouter>
      <GlobalRPGListener />
      <LayoutDecider>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
        </ErrorBoundary>
      </LayoutDecider>
    </BrowserRouter>
  );
}
