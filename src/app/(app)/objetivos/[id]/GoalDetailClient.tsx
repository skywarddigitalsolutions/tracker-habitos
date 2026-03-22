'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoalProgressUpdate } from '@/components/objetivos/GoalProgressUpdate';
import { Button } from '@/components/ui/Button';
import type { GoalProgressEntry } from '@/lib/supabase/types';
import { TrendingUp } from 'lucide-react';

interface GoalDetailClientProps {
  goalId: string;
  currentValue: number;
  targetValue: number;
  unit: string | null;
  progressEntries: GoalProgressEntry[];
}

export function GoalDetailClient({ goalId, currentValue, targetValue, unit, progressEntries }: GoalDetailClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="w-full mb-4"
        onClick={() => setShowModal(true)}
      >
        <TrendingUp size={16} className="mr-2" />
        Actualizar progreso
      </Button>

      {progressEntries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Historial de progreso</h3>
          <div className="space-y-3">
            {[...progressEntries].reverse().slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <span className="text-sm font-medium text-slate-100">{entry.value} {unit}</span>
                  {entry.note && (
                    <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(entry.recorded_at).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <GoalProgressUpdate
        goalId={goalId}
        currentValue={currentValue}
        targetValue={targetValue}
        unit={unit}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdated={() => router.refresh()}
      />
    </>
  );
}
