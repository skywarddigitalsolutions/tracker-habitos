'use client';

import { usePathname } from 'next/navigation';
import { MobileSettingsSheet } from './MobileSettingsSheet';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/habitos': 'Mis Hábitos',
  '/habitos/nuevo': 'Nuevo Hábito',
  '/estadisticas': 'Estadísticas',
  '/objetivos': 'Objetivos',
  '/objetivos/nuevo': 'Nuevo Objetivo',
  '/amigos': 'Amigos',
  '/perfil': 'Mi Perfil',
};

interface HeaderProps {
  action?: React.ReactNode;
}

export function Header({ action }: HeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'StoaTrack';

  return (
    <>
    <header
      role="banner"
      className="sticky top-0 z-20 px-4 md:hidden"
      style={{
        background: 'rgba(8, 8, 14, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between gap-3" style={{ minHeight: '56px' }}>
        <h1
          className="text-base font-bold text-white flex-1 min-w-0 truncate"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          {action && <div>{action}</div>}
          <MobileSettingsSheet />
        </div>
      </div>
    </header>
    {/* Spacer so content doesn't sit flush against the sticky header on mobile */}
    <div className="h-4 md:hidden" aria-hidden="true" />
    </>
  );
}
