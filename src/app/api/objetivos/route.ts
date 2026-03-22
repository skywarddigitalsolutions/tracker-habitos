import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, description, category_id, type, target_value, unit, start_date, end_date, is_public } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description || null,
      category_id: category_id || null,
      type: type ?? 'mensual',
      target_value: Number(target_value) || 100,
      current_value: 0,
      unit: unit || null,
      start_date,
      end_date,
      is_public: is_public ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
