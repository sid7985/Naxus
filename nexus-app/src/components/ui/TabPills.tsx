import React from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabPillsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function TabPills({ tabs, active, onChange, className = '' }: TabPillsProps) {
  return (
    <div className={`tab-pills ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`tab-pill flex items-center gap-1.5 ${active === tab.key ? 'active' : ''}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ml-0.5 text-[10px] opacity-60">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
