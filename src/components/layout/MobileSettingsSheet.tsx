'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Settings, User, LogOut, KeyRound, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function MobileSettingsSheet() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Trigger — lives inside Header */}
      <button
        type="button"
        aria-label="Configuración"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-xl transition-colors"
        style={{
          width: '40px',
          height: '40px',
          color: 'var(--text-secondary)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <Settings size={17} />
      </button>

      {/* Sheet — portaled to document.body to escape backdropFilter stacking context */}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Configuración"
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl animate-slide-up"
            style={{
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-hover)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-bold text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>
                Configuración
              </span>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Options */}
            <div className="px-4 py-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/perfil'); }}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-left"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent-text)' }}>
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Mi perfil</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Nombre, usuario, avatar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/perfil?tab=password'); }}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-left"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Cambiar contraseña</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Actualizar credenciales</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-left"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  opacity: signingOut ? 0.6 : 1,
                  cursor: signingOut ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                  <LogOut size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                    {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Salir de la cuenta</p>
                </div>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
