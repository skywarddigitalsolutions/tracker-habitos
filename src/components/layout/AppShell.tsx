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
    <div className="min-h-screen bg-slate-950">
      {/* Desktop sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
