'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface DataPoint {
  week: string;
  avg: number;
}

interface WeeklyAverageChartProps {
  data: DataPoint[];
}

export function WeeklyAverageChart({ data }: WeeklyAverageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#fbbf24' }}
          formatter={(v: unknown) => [Number(v).toFixed(1), 'Promedio estrellas']}
        />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#eab308" fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
