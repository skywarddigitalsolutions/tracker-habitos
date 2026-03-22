import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FriendsClient } from './FriendsClient';

export const dynamic = 'force-dynamic';

export default async function AmigosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get accepted friendships
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  // Get friend IDs
  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  // Get friend profiles
  const friends = friendIds.length > 0
    ? (await supabase.from('profiles').select('*').in('id', friendIds)).data ?? []
    : [];

  // Pending requests (sent to current user)
  const { data: pendingRaw } = await supabase
    .from('friendships')
    .select('*')
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  // Get requester profiles
  const requesterIds = (pendingRaw ?? []).map((f) => f.requester_id);
  const requesters = requesterIds.length > 0
    ? (await supabase.from('profiles').select('*').in('id', requesterIds)).data ?? []
    : [];

  const pending = (pendingRaw ?? []).map((f) => ({
    ...f,
    requester: requesters.find((p) => p.id === f.requester_id)!,
  })).filter((f) => f.requester);

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <Header />
      <div className="hidden md:block mb-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-100">Amigos</h1>
      </div>

      <FriendsClient friends={friends} pendingRequests={pending} />
    </div>
  );
}
