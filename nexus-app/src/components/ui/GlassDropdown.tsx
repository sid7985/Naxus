import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function GlassDropdown({
  options, value, onChange, placeholder = 'Select...', label, className = '',
}: GlassDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={ref}>
      {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input flex items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`flex items-center gap-2 text-xs ${selected ? 'text-white' : 'text-text-muted'}`}>
          {selected?.icon}
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute z-40 mt-1 w-full bg-elevated border border-glass-border rounded-xl shadow-glass-elevated overflow-hidden"
            style={{ backdropFilter: 'blur(20px)', top: '100%' }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="listbox"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${
                  opt.value === value ? 'bg-glass text-white' : 'text-text-secondary hover:bg-glass/50 hover:text-white'
                }`}
              >
                {opt.icon}
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
