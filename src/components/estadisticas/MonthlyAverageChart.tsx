'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MONTHS_ES } from '@/lib/constants';

interface DataPoint {
  month: number;
  avg: number;
}

interface MonthlyAverageChartProps {
  data: DataPoint[];
}

export function MonthlyAverageChart({ data }: MonthlyAverageChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: MONTHS_ES[d.month - 1]?.slice(0, 3) ?? '',
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#818cf8' }}
          formatter={(v: unknown) => [Number(v).toFixed(1), 'Promedio mensual']}
        />
        <Area
          type="monotone"
          dataKey="avg"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#ratingGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
