'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CheckSquare, BarChart2, Target, Users, LogOut, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-bold text-slate-100 text-lg">HábitosPro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium',
                active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link
          href="/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-sm"
        >
          <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center">
            <User size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-200 truncate">{user?.display_name ?? user?.username ?? 'Usuario'}</p>
            <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
          </div>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
