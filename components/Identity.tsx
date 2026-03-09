'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function Identity({ date }: { date: string }) {
  const { diaries, setField } = useDiaryStore();
  const diary = diaries[date];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">fingerprint</span>
        <h2 className="font-bold text-slate-800">정체성 (Identity)</h2>
      </div>
      <textarea
        className="w-full ruled-lines min-h-[100px] text-sm text-slate-600 resize-none bg-transparent border-none focus:ring-0 p-0 outline-none"
        placeholder="나는 어떤 사람인가? 나의 정체성을 기록하세요..."
        value={diary?.identity ?? ''}
        onChange={(e) => setField(date, 'identity', e.target.value)}
      />
    </section>
  );
}
