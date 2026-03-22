import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { username } = body;

  if (!username) return NextResponse.json({ error: 'username es obligatorio' }, { status: 400 });

  // Find target user
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  if (targetUser.id === user.id) {
    return NextResponse.json({ error: 'No puedes enviarte una solicitud a ti mismo' }, { status: 400 });
  }

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},addressee_id.eq.${user.id})`
    )
    .single();

  if (existing) {
    return NextResponse.json({
      error: existing.status === 'accepted' ? 'Ya son amigos' : 'Solicitud ya enviada',
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: targetUser.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
