import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLocalDateString } from '@/lib/utils/dates';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await request.json();

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (!challenge) return NextResponse.json({ error: 'Desafío no encontrado' }, { status: 404 });
  if (challenge.created_by !== user.id && challenge.invited_user !== user.id) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
  }

  if (action === 'accept') {
    if (challenge.invited_user !== user.id) {
      return NextResponse.json({ error: 'Solo el invitado puede aceptar' }, { status: 403 });
    }
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'active', started_at: getLocalDateString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (action === 'cancel') {
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
}

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (!challenge) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (challenge.created_by !== user.id && challenge.invited_user !== user.id) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
  }

  if (challenge.status !== 'active' || !challenge.started_at) {
    return NextResponse.json({ data: challenge, progress: null });
  }

  // Compute progress for both participants
  const participantIds = [challenge.created_by, challenge.invited_user];
  const endDate = new Date(challenge.started_at + 'T12:00:00');
  endDate.setDate(endDate.getDate() + challenge.duration_days - 1);
  const endStr = getLocalDateString(endDate);
  const today = getLocalDateString();
  const effectiveEnd = today < endStr ? today : endStr;

  const { data: records } = await supabase
    .from('habit_records')
    .select('user_id, date, completed')
    .in('user_id', participantIds)
    .gte('date', challenge.started_at)
    .lte('date', effectiveEnd);

  const progress = participantIds.map((pid) => {
    const userRecords = (records ?? []).filter((r) => r.user_id === pid);
    const completed = userRecords.filter((r) => r.completed).length;
    return { user_id: pid, days_completed: completed };
  });

  // Check if challenge is done
  const daysElapsed = Math.floor(
    (new Date(today + 'T12:00:00').getTime() - new Date(challenge.started_at + 'T12:00:00').getTime()) /
    (1000 * 60 * 60 * 24)
  ) + 1;

  if (daysElapsed >= challenge.duration_days) {
    await supabase
      .from('challenges')
      .update({ status: 'completed' })
      .eq('id', id);
  }

  return NextResponse.json({ data: challenge, progress });
}
