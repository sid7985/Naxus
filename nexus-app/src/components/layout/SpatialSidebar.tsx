import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SpatialSidebarProps {
  children: ReactNode;
  position?: 'left' | 'right';
  width?: string;
  className?: string;
}

export default function SpatialSidebar({
  children,
  position = 'left',
  width = 'w-60',
  className,
}: SpatialSidebarProps) {
  return (
    <div
      className={cn(
        'spatial-sidebar flex flex-col overflow-hidden shrink-0',
        width,
        position === 'left' ? 'ml-2.5 my-2.5 mr-0' : 'mr-2.5 my-2.5 ml-0',
        className
      )}
    >
      {children}
    </div>
  );
}
