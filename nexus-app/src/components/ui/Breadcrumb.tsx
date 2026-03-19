import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  command: 'Command Center',
  editor: 'Code Editor',
  settings: 'Settings',
  observability: 'Observability',
  memory: 'Memory',
  'memory-graph': 'Memory Graph',
  todo: 'Quick Todo',
  computer: 'Automations',
  rpg: 'RPG World',
  projects: 'Projects',
  vision: 'Screen Vision',
  tester: 'Tester Console',
  zeroclaw: 'Zero Claw',
  plugins: 'Plugins',
  voice: 'Voice Control',
  internet: 'Web Capabilities',
  workflows: 'Workflows',
  integrations: 'Integrations',
  launcher: 'Launcher',
  agent: 'Agent',
  mission: 'Mission',
};

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 px-5 py-1.5 text-[11px]" aria-label="Breadcrumb">
      <Link to="/" className="text-text-muted hover:text-white transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = ROUTE_LABELS[seg] || seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-text-muted/40" />
            {isLast ? (
              <span className="text-text-primary font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-text-muted hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
