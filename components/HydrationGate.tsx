'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDiaryStore } from '@/store/diaryStore';

export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useDiaryStore((s) => s._hasHydrated);
  const dbLoaded = useDiaryStore((s) => s._dbLoaded);
  const loadFromDb = useDiaryStore((s) => s.loadFromDb);
  const { status } = useSession();

  useEffect(() => {
    if (hasHydrated && status === 'authenticated' && !dbLoaded) {
      loadFromDb();
    }
  }, [hasHydrated, status, dbLoaded, loadFromDb]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">로딩 중...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
