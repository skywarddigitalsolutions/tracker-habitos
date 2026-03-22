'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
  className?: string;
}

export function StarRating({ value, onChange, size = 24, readonly = false, className }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-transform',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                filled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
