'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, BarChart2, Target, Users } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/habitos', label: 'Hábitos', icon: CheckSquare },
  { href: '/estadisticas', label: 'Stats', icon: BarChart2 },
  { href: '/objetivos', label: 'Metas', icon: Target },
  { href: '/amigos', label: 'Amigos', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: 'rgba(8, 8, 14, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'var(--safe-area-bottom)',
      }}
    >
      <div className="flex items-stretch justify-around" style={{ minHeight: '60px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="bottom-nav-item flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
              style={{ color: active ? 'var(--accent-text)' : 'var(--text-muted)' }}
            >
              <span className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                {active && (
                  <span
                    className="nav-dot absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: '18px',
                      height: '3px',
                      background: 'var(--accent-text)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .bottom-nav-item {
          transition: color 0.2s ease;
          touch-action: manipulation;
          min-width: 44px;
        }
        .bottom-nav-item:active {
          opacity: 0.7;
        }
      `}</style>
    </nav>
  );
}
