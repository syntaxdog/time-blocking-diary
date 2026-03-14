'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function Motivation({ date }: { date: string }) {
  const { diaries, setField } = useDiaryStore();
  const diary = diaries[date];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">psychology</span>
        <h2 className="font-bold text-slate-800">내적 동기</h2>
      </div>
      <textarea
        className="w-full ruled-lines min-h-[120px] text-sm text-slate-600 resize-none bg-transparent border-none focus:ring-0 p-0 outline-none"
        placeholder="오늘의 내적 동기를 기록하세요."
        maxLength={200}
        value={diary?.motivation ?? ''}
        onChange={(e) => setField(date, 'motivation', e.target.value)}
      />
    </section>
  );
}
