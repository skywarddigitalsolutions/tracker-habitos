import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { friendship_id } = body;

  if (!friendship_id) return NextResponse.json({ error: 'friendship_id es obligatorio' }, { status: 400 });

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendship_id)
    .or(`addressee_id.eq.${user.id},requester_id.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: null });
}
