import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { value, note } = body;

  if (value === undefined || value === null) {
    return NextResponse.json({ error: 'value es obligatorio' }, { status: 400 });
  }

  // Verify goal belongs to user
  const { data: goal } = await supabase
    .from('goals')
    .select('id, target_value')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!goal) return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 });

  const numValue = Number(value);

  // Insert progress entry
  await supabase.from('goal_progress_entries').insert({
    goal_id: id,
    user_id: user.id,
    value: numValue,
    note: note || null,
    recorded_at: new Date().toISOString(),
  });

  // Update goal current value
  const { data, error } = await supabase
    .from('goals')
    .update({
      current_value: numValue,
      is_completed: numValue >= goal.target_value,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
