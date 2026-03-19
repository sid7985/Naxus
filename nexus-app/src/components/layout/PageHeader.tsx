import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NeonIcon from '../ui/NeonIcon';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  badge?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  iconColor = '#7C3AED',
  badge,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg hover:bg-glass transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        {icon && <NeonIcon icon={icon} color={iconColor} size="sm" />}
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="text-xs text-text-muted font-mono ml-2 px-2 py-0.5 rounded-lg bg-glass border border-glass-border">
            {badge}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
