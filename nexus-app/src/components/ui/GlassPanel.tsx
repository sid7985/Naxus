import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassPanel({
  children,
  className,
  hover = false,
  glowColor,
  onClick,
  style: externalStyle,
}: GlassPanelProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        hover ? 'glass-panel-hover cursor-pointer' : 'glass-panel',
        className
      )}
      style={
        glowColor
          ? ({ ...externalStyle, '--glow-color': glowColor, boxShadow: `0 0 25px -5px ${glowColor}40` } as React.CSSProperties)
          : externalStyle
      }
    >
      {children}
    </div>
  );
}
