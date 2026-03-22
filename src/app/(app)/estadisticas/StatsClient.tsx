'use client';

import dynamic from 'next/dynamic';
import { AnnualCompletionGrid } from '@/components/estadisticas/AnnualCompletionGrid';

const CompletionRateChart = dynamic(
  () => import('@/components/estadisticas/CompletionRateChart').then((m) => ({ default: m.CompletionRateChart })),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800 animate-pulse rounded-lg" /> }
);

const WeeklyAverageChart = dynamic(
  () => import('@/components/estadisticas/WeeklyAverageChart').then((m) => ({ default: m.WeeklyAverageChart })),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800 animate-pulse rounded-lg" /> }
);

const MonthlyAverageChart = dynamic(
  () => import('@/components/estadisticas/MonthlyAverageChart').then((m) => ({ default: m.MonthlyAverageChart })),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800 animate-pulse rounded-lg" /> }
);

const CategoryBreakdownChart = dynamic(
  () => import('@/components/estadisticas/CategoryBreakdownChart').then((m) => ({ default: m.CategoryBreakdownChart })),
  { ssr: false, loading: () => <div className="h-[250px] bg-slate-800 animate-pulse rounded-lg" /> }
);

interface StatsClientProps {
  dailyData: { date: string; rate: number }[];
  weeklyData: { week: string; avg: number }[];
  monthlyData: { month: number; avg: number }[];
  categoryData: { category: string; rate: number }[];
  annualRecordsMap: Record<string, boolean>;
  year: number;
  overallRate: number;
  avgRating: number | null;
  totalCompleted: number;
}

export function StatsClient({
  dailyData,
  weeklyData,
  monthlyData,
  categoryData,
  annualRecordsMap,
  year,
  overallRate,
  avgRating,
  totalCompleted,
}: StatsClientProps) {
  const annualMap = new Map(Object.entries(annualRecordsMap));

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{overallRate}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Tasa global</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {avgRating != null ? avgRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Promedio ⭐</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completados</p>
        </div>
      </div>

      {/* Annual grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Actividad anual {year}</h3>
        <AnnualCompletionGrid allRecords={annualMap} year={year} />
      </div>

      {/* Daily completion rate */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Tasa de completado (últimos 30 días)</h3>
        <CompletionRateChart data={dailyData} />
      </div>

      {/* Weekly star average */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Promedio semanal de estrellas</h3>
        <WeeklyAverageChart data={weeklyData} />
      </div>

      {/* Monthly star average */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Promedio mensual de estrellas</h3>
        <MonthlyAverageChart data={monthlyData} />
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Completado por categoría</h3>
          <CategoryBreakdownChart data={categoryData} />
        </div>
      )}
    </div>
  );
}
