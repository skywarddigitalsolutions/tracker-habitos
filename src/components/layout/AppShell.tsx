'use client';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import type { Profile } from '@/lib/supabase/types';

interface AppShellProps {
  children: React.ReactNode;
  user: Profile | null;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      {/* Desktop sidebar — fixed, 256px */}
      <Sidebar user={user} />

      {/* Main layout — CSS grid pushes content right of sidebar on md+ */}
      <div
        style={{
          paddingLeft: 'var(--sidebar-offset, 0)',
        }}
      >
        <main
          id="main-content"
          className="pb-24 md:pb-8"
          style={{ minHeight: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      <style>{`
        @media (min-width: 768px) {
          :root { --sidebar-offset: 256px; }
        }
      `}</style>
    </div>
  );
}
