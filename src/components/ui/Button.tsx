import { cn } from '@/lib/utils/cn';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, style, ...props }, ref) => {

    const variantStyle: React.CSSProperties = variant === 'primary'
      ? {
          background: disabled || loading ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: 'white',
          boxShadow: disabled || loading ? 'none' : '0 0 16px rgba(124,58,237,0.3)',
        }
      : variant === 'secondary'
      ? {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        }
      : variant === 'ghost'
      ? {
          background: 'transparent',
          color: 'var(--text-secondary)',
        }
      : /* danger */ {
          background: disabled || loading ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.85)',
          color: 'white',
        };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        style={{ ...variantStyle, ...style }}
        onMouseEnter={e => {
          if (!disabled && !loading && variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)';
          }
        }}
        onMouseLeave={e => {
          if (!disabled && !loading && variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.3)';
          }
        }}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
