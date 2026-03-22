import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('habit_records')
    .select('*')
    .eq('user_id', user.id);

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query.order('date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { habit_id, date, completed } = body;

  if (!habit_id || !date) {
    return NextResponse.json({ error: 'habit_id y date son obligatorios' }, { status: 400 });
  }

  // Verify habit belongs to user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habit_id)
    .eq('user_id', user.id)
    .single();

  if (!habit) return NextResponse.json({ error: 'Hábito no encontrado' }, { status: 404 });

  const { data, error } = await supabase
    .from('habit_records')
    .upsert(
      { habit_id, user_id: user.id, date, completed: completed ?? true },
      { onConflict: 'habit_id,date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
