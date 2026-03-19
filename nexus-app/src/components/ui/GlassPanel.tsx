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
        spatial && 'rounded-[20px] p-6',
        neonBorder && 'neon-border',
        className
      )}
      style={
        glowColor
          ? ({
              ...externalStyle,
              '--glow-color': glowColor,
              '--neon-color': glowColor,
              boxShadow: `0 0 30px -5px ${glowColor}40, var(--shadow-glass)`,
            } as React.CSSProperties)
          : externalStyle
      }
    >
      {children}
    </div>
  );
}
