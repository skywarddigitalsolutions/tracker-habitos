'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={cn(
      'fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in min-w-[250px] max-w-sm',
      type === 'success'
        ? 'bg-green-900/90 border-green-700 text-green-100'
        : 'bg-red-900/90 border-red-700 text-red-100'
    )}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// Simple toast hook
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type });
  }

  function hideToast() {
    setToast(null);
  }

  return { toast, showToast, hideToast };
}
