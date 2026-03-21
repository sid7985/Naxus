import { useWorkspaceUiStore } from '../../stores/workspaceUiStore';
import { useEditorStore } from '../../stores/editorStore';
import { Terminal, AlertCircle, X } from 'lucide-react';

export default function BottomPanel() {
  const { isBottomPanelOpen, toggleBottomPanel, activeBottomPanelTab, setActiveBottomPanelTab } = useWorkspaceUiStore();
  const { terminalOutput } = useEditorStore();

  if (!isBottomPanelOpen) return null;

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: Terminal },
    { id: 'problems' as const, label: 'Problems', icon: AlertCircle, badge: 0 },
  ];

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        height: '220px',
        borderTop: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
        background: 'var(--bg-void, #050505)',
      }}
    >
      {/* Tab Row */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{
          height: '34px',
          borderBottom: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
        }}
      >
        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomPanelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomPanelTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
                style={{
                  fontSize: '11.5px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: isActive ? 'var(--hover-overlay, rgba(255,255,255,0.04))' : 'transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="ml-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: 'var(--status-error, #F43F5E)' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleBottomPanel}
            className="p-1 rounded-lg transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeBottomPanelTab === 'terminal' && (
          <div className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary, #8E8E9A)' }}>
            {terminalOutput.length > 0 ? (
              terminalOutput.map((line, i) => (
                <div key={i} className="py-0.5">
                  <span style={{ color: 'var(--agent-coder, #06B6D4)', opacity: 0.5 }}>{'>'} </span>
                  {line}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
                <Terminal className="w-5 h-5" />
                <span className="text-[11px]">NEXUS Native Code Editor Initialized.</span>
              </div>
            )}
          </div>
        )}
        {activeBottomPanelTab === 'problems' && (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted, #4A4A56)', fontSize: '12px' }}>
            No problems detected
          </div>
        )}
      </div>
    </div>
  );
}
