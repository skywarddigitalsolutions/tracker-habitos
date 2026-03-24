import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLocalDateString } from '@/lib/utils/dates';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .or(`created_by.eq.${user.id},invited_user.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { invited_username, habit_name, duration_days = 21 } = body;

  if (!invited_username || !habit_name) {
    return NextResponse.json({ error: 'invited_username y habit_name son obligatorios' }, { status: 400 });
  }

  // Resolve username to id
  const { data: invitedProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', invited_username)
    .single();

  if (!invitedProfile) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  // Verify friendship
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${invitedProfile.id}),and(requester_id.eq.${invitedProfile.id},addressee_id.eq.${user.id})`
    )
    .eq('status', 'accepted')
    .single();

  if (!friendship) return NextResponse.json({ error: 'Solo podés desafiar a tus amigos' }, { status: 403 });

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      created_by: user.id,
      invited_user: invitedProfile.id,
      habit_name,
      duration_days,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
