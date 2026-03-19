// NeonIcon — Gradient-glowing icon container

interface NeonIconProps {
  icon: React.ElementType;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
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
      className={`neon-icon ${s.container} ${className || ''}`}
      style={
        {
          '--neon-color': color,
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 20px ${color}25, inset 0 0 12px ${color}10`,
        } as React.CSSProperties
      }
    >
      <Icon className={s.icon} style={{ color, position: 'relative', zIndex: 1 }} />
    </div>
  );
}
