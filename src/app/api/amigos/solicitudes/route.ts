import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: pending } = await supabase
    .from('friendships')
    .select('*')
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  if (!pending || pending.length === 0) return NextResponse.json({ data: [] });

  const requesterIds = pending.map((f) => f.requester_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', requesterIds);

  const result = pending.map((f) => ({
    ...f,
    requester: profiles?.find((p) => p.id === f.requester_id) ?? null,
  }));

  return NextResponse.json({ data: result });
}
