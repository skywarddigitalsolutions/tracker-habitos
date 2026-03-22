'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Profile } from '@/lib/supabase/types';
import { User, LogOut, Save } from 'lucide-react';

interface ProfileClientProps {
  profile: Profile | null;
  email: string;
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [timezone, setTimezone] = useState(profile?.timezone ?? 'America/Argentina/Buenos_Aires');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, username, timezone })
        .eq('id', profile!.id);
      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={32} className="text-slate-400" />
          )}
        </div>
        <p className="font-semibold text-slate-100 text-lg">{profile?.display_name ?? profile?.username}</p>
        <p className="text-slate-500 text-sm">{email}</p>
      </div>

      {/* Edit form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Editar perfil</h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombre para mostrar"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu nombre"
          />

          <Input
            label="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu_usuario"
            helperText="Solo letras minúsculas, números y guiones bajos"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Zona horaria
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Santiago">Santiago (GMT-4)</option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <Button type="submit" loading={saving} className="w-full">
            <Save size={14} className="mr-2" />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </form>
      </div>

      {/* Sign out */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Sesión</h3>
        <Button variant="danger" onClick={handleSignOut} className="w-full">
          <LogOut size={14} className="mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
