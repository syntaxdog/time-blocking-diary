'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useDiaryStore((s) => s._hasHydrated);

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
