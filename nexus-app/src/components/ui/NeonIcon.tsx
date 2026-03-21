// NeonIcon — Gradient-glowing icon container

interface NeonIconProps {
  icon: React.ElementType;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', radius: '10px' },
  md: { container: 'w-11 h-11', icon: 'w-5 h-5', radius: '13px' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7', radius: '16px' },
};

export default function NeonIcon({
  icon: Icon,
  color,
  size = 'md',
  className,
}: NeonIconProps) {
  const s = SIZES[size];

  return (
    <div
      className={`flex items-center justify-center ${s.container} ${className || ''}`}
      style={
        {
          borderRadius: s.radius,
          background: `linear-gradient(135deg, ${color}15, ${color}30)`,
          border: `1px solid ${color}18`,
          boxShadow: `0 0 24px -4px ${color}15`,
        } as React.CSSProperties
      }
    >
      <Icon className={s.icon} style={{ color, position: 'relative', zIndex: 1 }} />
    </div>
  );
}
