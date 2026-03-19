import GlassPanel from '../ui/GlassPanel';

interface SkeletonProps {
  variant?: 'card' | 'line' | 'avatar' | 'block';
  count?: number;
  className?: string;
}

function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-lg bg-glass animate-pulse"
      style={{ width }}
    />
  );
}

export default function SkeletonLoader({ variant = 'card', count = 3, className }: SkeletonProps) {
  if (variant === 'line') {
    return (
      <div className={`space-y-3 ${className || ''}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonLine key={i} width={`${Math.max(40, 100 - i * 15)}%`} />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className || ''}`}>
        <div className="w-10 h-10 rounded-full bg-glass animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
        </div>
      </div>
    );
  }

  if (variant === 'block') {
    return (
      <GlassPanel className={`p-6 ${className || ''}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-glass animate-pulse" />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="40%" />
              <SkeletonLine width="60%" />
            </div>
          </div>
          <SkeletonLine />
          <SkeletonLine width="80%" />
        </div>
      </GlassPanel>
    );
  }

  // Default: card grid
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <GlassPanel key={i} className="p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-glass animate-pulse" />
            <SkeletonLine width="70%" />
            <SkeletonLine width="50%" />
            <SkeletonLine />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
