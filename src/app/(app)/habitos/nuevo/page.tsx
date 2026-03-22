'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HabitForm } from '@/components/habitos/HabitForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoHabitoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: {
    name: string;
    description: string;
    category_id: number | null;
    color: string;
    is_public: boolean;
  }) {
    setLoading(true);
    try {
      const res = await fetch('/api/habitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      router.push('/habitos');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/habitos" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-400" />
        </Link>
        <h1 className="text-xl font-bold text-slate-100">Nuevo hábito</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <HabitForm onSubmit={handleSubmit} loading={loading} submitLabel="Crear hábito" />
      </div>
    </div>
  );
}
