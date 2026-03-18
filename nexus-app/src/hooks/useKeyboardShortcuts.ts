// ===== NEXUS Keyboard Shortcuts Hook =====
// Global keyboard shortcuts that work across all screens

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  meta?: boolean;  // ⌘ on Mac
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: '1', meta: true, action: () => navigate('/'), description: 'Command Center' },
    { key: '2', meta: true, action: () => navigate('/editor'), description: 'Code Editor' },
    { key: '3', meta: true, action: () => navigate('/observability'), description: 'Observability' },
    { key: '4', meta: true, action: () => navigate('/memory'), description: 'Memory' },
    { key: '5', meta: true, action: () => navigate('/computer'), description: 'Computer Mode' },

    // Actions
    { key: 'n', meta: true, action: () => navigate('/mission/new'), description: 'New Mission' },
    { key: ',', meta: true, action: () => navigate('/settings'), description: 'Settings' },
    { key: 'p', meta: true, shift: true, action: () => navigate('/projects'), description: 'Projects' },

    // Agent shortcuts
    { key: 'm', meta: true, shift: true, action: () => navigate('/agent/agent-manager'), description: 'Chat Manager' },
    { key: 'c', meta: true, shift: true, action: () => navigate('/agent/agent-coder'), description: 'Chat Coder' },
    { key: 'd', meta: true, shift: true, action: () => navigate('/agent/agent-designer'), description: 'Chat Designer' },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const metaMatch = shortcut.meta ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (e.key === shortcut.key && metaMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export default useKeyboardShortcuts;
