import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl', className)}>
      {header && (
        <div className="px-5 py-4 border-b border-slate-800">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-slate-800">
          {footer}
        </div>
      )}
    </div>
  );
}
