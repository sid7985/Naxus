import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, icon, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || `glass-input-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`glass-input ${icon ? 'pl-9' : ''} ${error ? '!border-red-500/50 focus:!border-red-500' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-[10px] text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[10px] text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
export default GlassInput;
