'use client';

import { HabitCompletionGrid } from '@/components/habitos/HabitCompletionGrid';

interface AnnualCompletionGridProps {
  allRecords: Map<string, boolean>;
  year: number;
}

export function AnnualCompletionGrid({ allRecords, year }: AnnualCompletionGridProps) {
  return (
    <div>
      <HabitCompletionGrid
        records={allRecords}
        viewMode="anual"
        year={year}
      />
    </div>
  );
}
