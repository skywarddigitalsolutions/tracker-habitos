import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXP, XP_REWARDS } from '@/lib/gamification/xp';
import { awardBadge } from '@/lib/gamification/badges';
import { getLocalDateString } from '@/lib/utils/dates';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to_id } = await request.json();
  if (!to_id) return NextResponse.json({ error: 'to_id es obligatorio' }, { status: 400 });
  if (to_id === user.id) return NextResponse.json({ error: 'No podés animarte a vos mismo' }, { status: 400 });

  // Rate limit: max 1 ánimo por día por persona
  const today = getLocalDateString();
  const { data: existing } = await supabase
    .from('encouragements')
    .select('id')
    .eq('from_id', user.id)
    .eq('to_id', to_id)
    .gte('created_at', today + 'T00:00:00')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Ya animaste a esta persona hoy' }, { status: 409 });
  }

  await supabase.from('encouragements').insert({ from_id: user.id, to_id });

  // XP al que anima
  await awardXP(supabase, user.id, XP_REWARDS.ENCOURAGE_FRIEND);

  // Verificar badge encourager_10
  const { count } = await supabase
    .from('encouragements')
    .select('id', { count: 'exact', head: true })
    .eq('from_id', user.id);

  if ((count ?? 0) >= 10) {
    await awardBadge(supabase, user.id, 'encourager_10');
  }

  return NextResponse.json({ ok: true });
}

// Cuántos ánimos recibió el usuario hoy
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = getLocalDateString();
  const { data } = await supabase
    .from('encouragements')
    .select('from_id, created_at')
    .eq('to_id', user.id)
    .gte('created_at', today + 'T00:00:00');

  return NextResponse.json({ data: data ?? [] });
}
