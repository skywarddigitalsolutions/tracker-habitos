import { cn } from '@/lib/utils/cn';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-glass w-full px-4 py-3 text-sm', className)}
          style={error ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
          {...props}
        />
        {error && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{error}</p>}
        {helperText && !error && <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
