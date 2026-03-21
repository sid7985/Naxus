import { useWorkspaceUiStore } from '../../stores/workspaceUiStore';
import ExplorerPanel from '../ide/ExplorerPanel';
import SearchPanel from '../ide/SearchPanel';
import GitPanel from '../ide/GitPanel';
import ExtensionsPanel from '../ide/ExtensionsPanel';

export default function Sidebar() {
  const { isSidebarOpen, activeSidebarPanel } = useWorkspaceUiStore();

  if (!isSidebarOpen || !activeSidebarPanel) {
    return null;
  }

  let PanelContent = null;
  switch (activeSidebarPanel) {
    case 'explorer':
      PanelContent = <ExplorerPanel />;
      break;
    case 'search':
      PanelContent = <SearchPanel />;
      break;
    case 'git':
      PanelContent = <GitPanel />;
      break;
    case 'plugins':
      PanelContent = <ExtensionsPanel />;
      break;
    default:
      PanelContent = <div className="p-4 text-xs" style={{ color: 'var(--text-muted)' }}>Unknown Panel</div>;
  }

  return (
    <div 
      className="flex flex-col shrink-0"
      style={{ 
        width: '250px',
        background: 'var(--bg-sidebar, #0B0B0E)',
        borderRight: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
        height: '100%'
      }}
    >
      {/* Panel Header */}
      <div 
        className="px-4 flex items-center" 
        style={{ 
          height: '35px', 
          borderBottom: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))'
        }}
      >
        <span className="text-[11px] uppercase font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {activeSidebarPanel}
        </span>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto">
        {PanelContent}
      </div>
    </div>
  );
}
