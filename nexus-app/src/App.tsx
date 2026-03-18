import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import CommandPalette from './components/ui/CommandPalette';
import ToastContainer from './components/ui/ToastContainer';
import LauncherPage from './pages/LauncherPage';
import CommandCenterPage from './pages/CommandCenterPage';
import AgentProfilePage from './pages/AgentProfilePage';
import MissionBuilderPage from './pages/MissionBuilderPage';
import CodeEditorPage from './pages/CodeEditorPage';
import SettingsPage from './pages/SettingsPage';
import ObservabilityPage from './pages/ObservabilityPage';
import MemoryPage from './pages/MemoryPage';
import ComputerModePage from './pages/ComputerModePage';
import RPGWorldPage from './pages/RPGWorldPage';
import AgentCreatorPage from './pages/AgentCreatorPage';
import ProjectManagerPage from './pages/ProjectManagerPage';
import ScreenVisionPage from './pages/ScreenVisionPage';
import TesterConsolePage from './pages/TesterConsolePage';
import ZeroClawPage from './pages/ZeroClawPage';
import PluginManagerPage from './pages/PluginManagerPage';
import WorkflowPage from './pages/WorkflowPage';
import IntegrationsPage from './pages/IntegrationsPage';
import VoiceControlPage from './pages/VoiceControlPage';
import InternetControlPage from './pages/InternetControlPage';
import './styles/themes.css';
import './services/missionQueue'; // Initialize background tasks

function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className="h-full w-full bg-void nebula-bg" data-theme={theme}>
      <CommandPalette />
      <ToastContainer />
      {children}
    </div>
  );
}

function GlobalRPGListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSetupComplete = useSettingsStore((state) => state.workspace.isSetupComplete);

  // Global toggle for RPG World Mode (⌘G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'g') {
        e.preventDefault();
        
        // Don't toggle if we're in setup
        if (!isSetupComplete) return;

        if (location.pathname === '/rpg') {
          navigate('/');
        } else {
          navigate('/rpg');
        }
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
        <Routes>
          <Route path="/launcher" element={<LauncherPage />} />

          <Route path="/" element={isSetupComplete ? <CommandCenterPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/agent/:agentId" element={isSetupComplete ? <AgentProfilePage /> : <Navigate to="/launcher" replace />} />
          <Route path="/mission/new" element={isSetupComplete ? <MissionBuilderPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/editor" element={isSetupComplete ? <CodeEditorPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/settings" element={isSetupComplete ? <SettingsPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/observability" element={isSetupComplete ? <ObservabilityPage /> : <Navigate to="/launcher" replace />} />
          <Route path="/memory" element={isSetupComplete ? <MemoryPage /> : <Navigate to="/launcher" replace />} />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
