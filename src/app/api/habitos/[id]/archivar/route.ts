import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get current state
  const { data: habit } = await supabase
    .from('habits')
    .select('is_archived')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!habit) return NextResponse.json({ error: 'Hábito no encontrado' }, { status: 404 });

  const newArchived = !habit.is_archived;

  const { data, error } = await supabase
    .from('habits')
    .update({
      is_archived: newArchived,
      archived_at: newArchived ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
