import { useLocation, useNavigate } from 'react-router-dom';
import {
  Files, Search, GitBranch, Bot, Puzzle, FlaskConical,
  Settings, LayoutDashboard
} from 'lucide-react';
import { useWorkspaceUiStore, SidebarPanelType } from '../../stores/workspaceUiStore';

interface ActivityItem {
  icon: typeof Files;
  label: string;
  id: SidebarPanelType | string;
  badge?: number;
  position?: 'top' | 'bottom';
  isPanel?: boolean;
}

const ACTIVITIES: ActivityItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: '/', isPanel: false },
  { icon: Files, label: 'Explorer', id: 'explorer', isPanel: true },
  { icon: Search, label: 'Search', id: 'search', isPanel: true },
  { icon: GitBranch, label: 'Source Control', id: 'git', isPanel: true },
  { icon: Bot, label: 'Agents', id: '/command', badge: 6, isPanel: false },
  { icon: Puzzle, label: 'Extensions', id: 'plugins', isPanel: true },
  { icon: FlaskConical, label: 'Testing', id: '/tester', isPanel: false },
  { icon: Settings, label: 'Settings', id: '/settings', position: 'bottom', isPanel: false },
];

export default function ActivityBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSidebarPanel, setActiveSidebarPanel, toggleSidebar, isSidebarOpen } = useWorkspaceUiStore();

  const topItems = ACTIVITIES.filter((a) => a.position !== 'bottom');
  const bottomItems = ACTIVITIES.filter((a) => a.position === 'bottom');

  const handleItemClick = (item: ActivityItem) => {
    if (!item.isPanel) {
      navigate(item.id as string);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
      }
      const panelId = item.id as SidebarPanelType;
      if (activeSidebarPanel === panelId && isSidebarOpen) {
        toggleSidebar();
      } else {
        setActiveSidebarPanel(panelId);
      }
    }
  };

  const isItemActive = (item: ActivityItem) => {
    if (item.isPanel) {
      return location.pathname === '/' && isSidebarOpen && activeSidebarPanel === item.id;
    }
    if (item.id === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.id as string);
  };

  const renderIcon = (item: ActivityItem) => {
    const Icon = item.icon;
    const active = isItemActive(item);
    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        className="relative flex items-center justify-center transition-all duration-200 group"
        title={item.label}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '14px',
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          background: active ? 'var(--bg-glass-hover, rgba(255,255,255,0.06))' : 'transparent',
        }}
      >
        <Icon className="w-[20px] h-[20px] transition-colors" strokeWidth={active ? 1.8 : 1.4} />

        {/* Badge */}
        {item.badge && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ background: 'var(--agent-manager)' }}
          >
            {item.badge}
          </span>
        )}

        {/* Active dot indicator */}
        {active && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: 'var(--text-primary)' }}
          />
        )}
      </button>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-between py-3 shrink-0"
      style={{
        width: '56px',
        background: 'var(--bg-activitybar, #080808)',
        borderRight: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
      }}
    >
      <div className="flex flex-col items-center gap-1 w-full">
        {topItems.map(renderIcon)}
      </div>
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Separator dot */}
        <div className="w-5 h-[1px] rounded-full mb-1 opacity-30" style={{ background: 'var(--border-color)' }} />
        {bottomItems.map(renderIcon)}
      </div>
    </div>
  );
}
