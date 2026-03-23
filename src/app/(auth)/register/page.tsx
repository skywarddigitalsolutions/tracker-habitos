'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  if (password.length < 6) return { level: 1, label: 'Débil', color: '#ef4444' };
  if (password.length < 10) return { level: 2, label: 'Regular', color: '#f59e0b' };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 10) {
    return { level: 4, label: 'Fuerte', color: '#10b981' };
  }
  return { level: 3, label: 'Buena', color: '#6366f1' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(formData.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      setError('El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          display_name: formData.username,
        },
      },
    });

    if (authError) {
      setError(
        authError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese correo.'
          : 'Error al crear la cuenta. Intentá de nuevo.'
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <>
      <h2
        className="text-xl font-bold text-white mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Crear cuenta
      </h2>

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
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Nombre de usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="tu_usuario"
            className="input-glass px-4 py-3 text-sm"
            aria-describedby="username-hint"
          />
          <p id="username-hint" className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Solo letras minúsculas, números y guiones bajos
          </p>
        </div>

        {/* Email */}
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
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="input-glass px-4 py-3 text-sm"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-glass px-4 py-3 text-sm pr-12"
              aria-describedby="password-strength"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {/* Strength indicator */}
          {formData.password.length > 0 && (
            <div id="password-strength" className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background: lvl <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-glass px-4 py-3 text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {showConfirm ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
            {/* Match indicator */}
            {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
              <Check
                size={16}
                className="absolute right-11 top-1/2 -translate-y-1/2"
                style={{ color: '#10b981' }}
                aria-hidden="true"
              />
            )}
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
              Creando cuenta...
            </span>
          ) : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="font-semibold transition-colors"
          style={{ color: 'var(--accent-text)' }}
        >
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
