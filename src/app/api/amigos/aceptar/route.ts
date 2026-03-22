import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { friendship_id } = body;

  if (!friendship_id) return NextResponse.json({ error: 'friendship_id es obligatorio' }, { status: 400 });

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendship_id)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });

  return NextResponse.json({ data });
}
