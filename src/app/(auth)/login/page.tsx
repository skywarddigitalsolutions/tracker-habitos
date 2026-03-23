'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Correo o contraseña incorrectos. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <>
      <h2
        className="text-xl font-bold text-white mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Iniciar sesión
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Bienvenido de vuelta
      </p>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2.5 text-sm rounded-xl p-3.5 mb-5 animate-fade-up"
          style={{
            background: 'var(--error-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            color: '#f87171',
          }}
        >
          <AlertCircle size={15} aria-hidden="true" style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="input-glass px-4 py-3 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Contraseña
            </label>
            <Link
              href="#"
              className="text-xs transition-colors"
              style={{ color: 'var(--accent-text)' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-glass px-4 py-3 text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 mt-2"
          style={{
            background: loading
              ? 'rgba(124, 58, 237, 0.4)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: loading ? 'none' : '0 0 20px rgba(124, 58, 237, 0.35)',
            cursor: loading ? 'not-allowed' : 'pointer',
            minHeight: '48px',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Ingresando...
            </span>
          ) : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
        ¿No tenés cuenta?{' '}
        <Link
          href="/register"
          className="font-semibold transition-colors"
          style={{ color: 'var(--accent-text)' }}
        >
          Registrarse
        </Link>
      </p>
    </>
  );
}
