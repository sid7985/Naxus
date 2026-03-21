import { useSettingsStore } from '../../stores/settingsStore';
import { useLocation } from 'react-router-dom';
import {
  GitBranch, AlertCircle, AlertTriangle, Sun, Moon, Wifi, WifiOff, Bot
} from 'lucide-react';

export default function StatusBar() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const workspace = useSettingsStore((s) => s.workspace);
  const location = useLocation();

  const pageName = (() => {
    const map: Record<string, string> = {
      '/': 'Dashboard',
      '/command': 'Command Center',
      '/editor': 'Code Editor',
      '/search': 'Search',
      '/git': 'Source Control',
      '/settings': 'Settings',
      '/observability': 'Observability',
      '/memory': 'Memory',
      '/memory-graph': 'Memory Graph',
      '/plugins': 'Extensions',
      '/tester': 'Testing',
      '/todo': 'Todo',
      '/workflows': 'Workflows',
      '/integrations': 'Integrations',
      '/voice': 'Voice Control',
      '/internet': 'Internet Control',
      '/computer': 'Computer Mode',
      '/rpg': 'RPG World',
      '/projects': 'Projects',
      '/vision': 'Screen Vision',
      '/zeroclaw': 'Zero Claw',
      '/shortcuts': 'Shortcuts',
    };
    return map[location.pathname] || 'NEXUS';
  })();

  return (
    <div
      className="flex items-center justify-between px-3 shrink-0 select-none"
      style={{
        height: '26px',
        background: 'var(--bg-statusbar, #0A0A0C)',
        borderTop: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
        fontSize: '11px',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: 'var(--statusbar-fg, #6E6E7A)' }}>
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </button>
        <button className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: 'var(--statusbar-fg, #6E6E7A)' }}>
          <AlertCircle className="w-2.5 h-2.5" />
          <span>0</span>
          <AlertTriangle className="w-2.5 h-2.5 ml-1" />
          <span>0</span>
        </button>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2" style={{ color: 'var(--statusbar-fg-active, #A0A0AC)' }}>
        <span>{pageName}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1" style={{ color: 'var(--statusbar-fg, #6E6E7A)' }}>
          <Bot className="w-2.5 h-2.5" />
          llama3.2
        </span>

        <span className="flex items-center gap-1" style={{ color: 'var(--statusbar-fg, #6E6E7A)' }}>
          {workspace.isSetupComplete ? (
            <><Wifi className="w-2.5 h-2.5" /> Connected</>
          ) : (
            <><WifiOff className="w-2.5 h-2.5" /> Offline</>
          )}
        </span>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--statusbar-fg, #6E6E7A)' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
        </button>
      </div>
    </div>
  );
}
