import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const AVAILABLE_MODELS = [
  'Gemini 1.5 Pro',
  'Claude 3.5 Sonnet',
  'GPT-4o',
  'llama3.2:latest',
  'llama3.2-vision:latest'
];

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { workspace, setModelAssignment } = useSettingsStore();
  const currentModel = workspace.modelAssignments.coder || 'llama3.2:latest';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void/80 border border-glass-border hover:bg-glass hover:border-text-muted/30 transition-all text-xs text-text-secondary"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-agent-coder animate-pulse" />
        <span className="truncate max-w-[120px]">{currentModel}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-void border border-glass-border shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="px-3 py-2 border-b border-glass-border bg-glass/20">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Select Model</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-1 py-1.5">
              {AVAILABLE_MODELS.map(model => (
                <button
                  key={model}
                  onClick={() => {
                    setModelAssignment('coder', model);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentModel === model ? 'bg-agent-coder/10 text-agent-coder' : 'text-text-secondary hover:bg-glass hover:text-white'
                  }`}
                >
                  <span className="truncate">{model}</span>
                  {currentModel === model && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
