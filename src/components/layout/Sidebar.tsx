'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, CheckSquare, BarChart2, Target, Users,
  LogOut, User, Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/habitos', label: 'Hábitos', icon: CheckSquare },
  { href: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { href: '/objetivos', label: 'Objetivos', icon: Target },
  { href: '/amigos', label: 'Amigos', icon: Users },
];

interface SidebarProps {
  user: Profile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const displayName = user?.display_name ?? user?.username ?? 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      aria-label="Navegación principal"
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30"
      style={{
        width: '256px',
        background: 'rgba(255,255,255,0.025)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          aria-hidden="true"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 gradient-accent glow-sm"
        >
          <Sparkles size={16} className="text-white" />
        </div>
        <span
          className="font-bold text-white text-base tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          StoaTrack
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Secciones" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: active ? 'rgba(124, 58, 237, 0.14)' : 'transparent',
                color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                border: active ? '1px solid rgba(124, 58, 237, 0.22)' : '1px solid transparent',
              }}
            >
              <Icon
                size={17}
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="px-3 py-4 space-y-1"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link
          href="/perfil"
          aria-current={pathname === '/perfil' ? 'page' : undefined}
          className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group"
          style={{ color: 'var(--text-secondary)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white gradient-accent"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{displayName}</p>
            {user?.username && (
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                @{user.username}
              </p>
            )}
          </div>
          <User size={14} aria-hidden="true" />
        </Link>

        <button
          onClick={handleSignOut}
          className="sidebar-link-danger w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>

      <style>{`
        .sidebar-link:hover {
          background: var(--surface-hover) !important;
          color: var(--text-primary) !important;
          border-color: var(--border-hover) !important;
        }
        .sidebar-link[aria-current="page"]:hover {
          background: rgba(124, 58, 237, 0.20) !important;
          color: var(--accent-text) !important;
        }
        .sidebar-link-danger:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #f87171 !important;
        }
      `}</style>
    </aside>
  );
}
