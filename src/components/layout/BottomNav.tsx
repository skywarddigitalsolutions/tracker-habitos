'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, BarChart2, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/habitos', label: 'Hábitos', icon: CheckSquare },
  { href: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { href: '/objetivos', label: 'Objetivos', icon: Target },
  { href: '/amigos', label: 'Amigos', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
      <div className="flex items-center justify-around h-16" style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
