import type { AgentStatus } from '../../lib/types';
import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<AgentStatus, { bg: string; label: string }> = {
  idle: { bg: 'bg-[#606070]', label: 'Idle' },
  thinking: { bg: 'bg-[#F59E0B] animate-pulse', label: 'Thinking' },
  acting: { bg: 'bg-[#06B6D4]', label: 'Acting' },
  done: { bg: 'bg-[#10B981]', label: 'Done' },
  error: { bg: 'bg-[#F43F5E]', label: 'Error' },
};

interface StatusBadgeProps {
  status: AgentStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, showLabel = false, size = 'sm' }: StatusBadgeProps) {
  const { bg, label } = STATUS_STYLES[status];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('rounded-full', dotSize, bg)} />
      {showLabel && (
        <span className="text-xs text-text-secondary uppercase tracking-wide font-mono">
          {label}
        </span>
      )}
    </div>
  );
}
