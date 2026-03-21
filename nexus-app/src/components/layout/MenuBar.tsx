import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { Sun, Moon } from 'lucide-react';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export default function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus: MenuGroup[] = [
    {
      label: 'File',
      items: [
        { label: 'New File', shortcut: '⌘N', action: () => navigate('/editor') },
        { label: 'Open Folder...', shortcut: '⌘O', action: () => navigate('/editor') },
        { label: 'divider', divider: true },
        { label: 'Save', shortcut: '⌘S' },
        { label: 'Save As...', shortcut: '⇧⌘S' },
        { label: 'divider', divider: true },
        { label: 'Preferences', shortcut: '⌘,', action: () => navigate('/settings') },
        { label: 'divider', divider: true },
        { label: 'Close Window', shortcut: '⇧⌘W' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { label: 'divider', divider: true },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'divider', divider: true },
        { label: 'Find', shortcut: '⌘F' },
        { label: 'Replace', shortcut: '⌥⌘F' },
        { label: 'divider', divider: true },
        { label: 'Find in Files', shortcut: '⇧⌘F', action: () => navigate('/search') },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Command Palette...', shortcut: '⇧⌘P' },
        { label: 'divider', divider: true },
        { label: 'Explorer', shortcut: '⇧⌘E', action: () => navigate('/editor') },
        { label: 'Search', shortcut: '⇧⌘F', action: () => navigate('/search') },
        { label: 'Source Control', shortcut: '⌃⇧G', action: () => navigate('/git') },
        { label: 'Agents', shortcut: '⌘1', action: () => navigate('/command') },
        { label: 'divider', divider: true },
        { label: 'Toggle Theme', action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
      ],
    },
    {
      label: 'Go',
      items: [
        { label: 'Go to File...', shortcut: '⌘P' },
        { label: 'Go to Symbol...', shortcut: '⌘T' },
        { label: 'divider', divider: true },
        { label: 'Go to Definition', shortcut: 'F12' },
        { label: 'Go to References', shortcut: '⇧F12' },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Start Mission', action: () => navigate('/mission/new') },
        { label: 'Run Agent Task', action: () => navigate('/command') },
        { label: 'divider', divider: true },
        { label: 'Start Debugging', shortcut: 'F5', disabled: true },
        { label: 'Stop', shortcut: '⇧F5', disabled: true },
      ],
    },
    {
      label: 'Terminal',
      items: [
        { label: 'New Terminal', shortcut: '⌃⇧`', action: () => navigate('/editor') },
        { label: 'divider', divider: true },
        { label: 'Run Task...', action: () => navigate('/workflows') },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Keyboard Shortcuts', shortcut: '⌘K ⌘S', action: () => navigate('/shortcuts') },
        { label: 'divider', divider: true },
        { label: 'About NEXUS' },
      ],
    },
  ];

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled || item.divider) return;
    item.action?.();
    setOpenMenu(null);
  };

  return (
    <div
      ref={menuBarRef}
      className="flex items-center h-[32px] px-3 select-none"
      style={{
        background: 'var(--bg-menubar, #0A0A0C)',
        borderBottom: '1px solid var(--border-color-subtle, rgba(255,255,255,0.04))',
        fontSize: '12.5px',
        zIndex: 'var(--z-header, 20)',
      }}
    >
      {/* App Logo */}
      <div className="flex items-center gap-1.5 mr-4 px-1">
        <div className="w-4 h-4 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-purple, linear-gradient(135deg, #A855F7, #6366F1))' }}>
          <span className="text-[7px] font-bold text-white">N</span>
        </div>
      </div>

      {/* Menu Items */}
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => handleMenuClick(menu.label)}
            onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
            className="px-2.5 py-1 rounded-lg transition-all duration-150"
            style={{
              color: openMenu === menu.label ? 'var(--text-primary)' : 'var(--text-muted)',
              background: openMenu === menu.label ? 'var(--hover-overlay, rgba(255,255,255,0.04))' : 'transparent',
            }}
          >
            {menu.label}
          </button>

          {openMenu === menu.label && (
            <div
              className="absolute top-[30px] left-0 py-1.5 min-w-[230px] overflow-hidden"
              style={{
                background: 'var(--bg-elevated, #0D0D0F)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                borderRadius: '16px',
                zIndex: 50,
                boxShadow: 'var(--shadow-glass-elevated, 0 8px 40px rgba(0,0,0,0.5))',
                backdropFilter: 'blur(24px)',
              }}
            >
              {menu.items.map((item, idx) =>
                item.divider ? (
                  <div
                    key={`d-${idx}`}
                    className="my-1.5 mx-3"
                    style={{ height: '1px', background: 'var(--border-color-subtle, rgba(255,255,255,0.04))' }}
                  />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between px-3.5 py-[6px] text-left transition-all duration-150 rounded-lg mx-1"
                    style={{
                      width: 'calc(100% - 8px)',
                      color: item.disabled ? 'var(--text-dim, #2E2E38)' : 'var(--text-secondary, #8E8E9A)',
                      cursor: item.disabled ? 'default' : 'pointer',
                      fontSize: '12.5px',
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay, rgba(255,255,255,0.04))';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = item.disabled ? 'var(--text-dim)' : 'var(--text-secondary)';
                    }}
                    disabled={item.disabled}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span style={{ color: 'var(--text-dim, #2E2E38)', fontSize: '11px' }}>{item.shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {/* Right side: Theme Toggle */}
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg transition-all duration-150"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
