'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function Gratitude({ date }: { date: string }) {
  const { diaries, setGratitude } = useDiaryStore();
  const diary = diaries[date];

  return (
    <section className="bg-[var(--color-primary)]/5 rounded-xl p-5 border border-[var(--color-primary)]/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">favorite</span>
        <h2 className="font-bold text-[var(--color-primary)]">감사 일기</h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-[var(--color-primary)] font-bold">1.</span>
          <input
            className="border-b border-[var(--color-primary)]/20 w-full pb-1 text-sm bg-transparent outline-none focus:border-[var(--color-primary)] transition-colors"
            placeholder="감사한 것을 적어보세요..."
            value={diary?.gratitude ?? ''}
            onChange={(e) => setGratitude(date, e.target.value)}
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[var(--color-primary)] font-bold">2.</span>
          <div className="border-b border-[var(--color-primary)]/20 w-full pb-1 text-sm" />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[var(--color-primary)] font-bold">3.</span>
          <div className="border-b border-[var(--color-primary)]/20 w-full pb-1 text-sm" />
        </div>
      </div>
    </section>
  );
}
