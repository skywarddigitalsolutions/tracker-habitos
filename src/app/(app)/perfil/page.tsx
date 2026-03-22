import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <Header />
      <div className="hidden md:block mb-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-100">Mi Perfil</h1>
      </div>
      <ProfileClient profile={profile} email={user.email ?? ''} />
    </div>
  );
}
