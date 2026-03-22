'use client';

import { usePathname } from 'next/navigation';

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

  const title = pageTitles[pathname] ?? 'HábitosPro';

  return (
    <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
