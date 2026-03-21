import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
  spatial?: boolean;
  neonBorder?: boolean;
  glowColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassPanel({
  children,
  className,
  hover = false,
  elevated = false,
  spatial = false,
  neonBorder = false,
  glowColor,
  onClick,
  style: externalStyle,
}: GlassPanelProps) {
  const baseClass = elevated
    ? 'glass-elevated'
    : hover
      ? 'glass-panel-hover cursor-pointer'
      : 'glass-panel';

  return (
    <div
      onClick={onClick}
      className={cn(
        baseClass,
        spatial && 'rounded-[22px] p-6',
        neonBorder && 'neon-border',
        className
      )}
      style={
        glowColor
          ? ({
              ...externalStyle,
              '--glow-color': glowColor,
              '--neon-color': glowColor,
              boxShadow: `0 0 40px -12px ${glowColor}20, var(--shadow-card, 0 2px 12px rgba(0,0,0,0.4))`,
            } as React.CSSProperties)
          : externalStyle
      }
    >
      {children}
    </div>
  );
}
