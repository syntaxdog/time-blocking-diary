'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function Gratitude({ date }: { date: string }) {
  const { diaries, setGratitude } = useDiaryStore();
  const diary = diaries[date];
  const gratitude = diary?.gratitude ?? ['', '', ''];

  return (
    <section className="bg-[var(--color-primary)]/5 rounded-xl p-5 border border-[var(--color-primary)]/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">favorite</span>
        <h2 className="font-bold text-[var(--color-primary)]">감사 일기</h2>
      </div>
      <div className="space-y-3">
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[var(--color-primary)] font-bold text-sm shrink-0 w-5 text-right">{idx + 1}.</span>
            <input
              className="border-b border-[var(--color-primary)]/20 w-full pb-1 text-sm bg-transparent outline-none focus:border-[var(--color-primary)] transition-colors"
              placeholder="감사한 것을 적어보세요."
              value={gratitude[idx] ?? ''}
              onChange={(e) => setGratitude(date, idx, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
