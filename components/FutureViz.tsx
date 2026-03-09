'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function FutureViz({ date }: { date: string }) {
  const { diaries, setFutureViz } = useDiaryStore();
  const diary = diaries[date];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">auto_awesome</span>
        <h2 className="font-bold text-slate-800">미래 시각화</h2>
      </div>
      <div className="rounded-lg h-32 w-full bg-slate-100 mb-3 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent" />
        <div className="p-3 text-xs text-slate-400 italic">이미지나 비전을 기록하세요</div>
      </div>
      <textarea
        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 resize-none h-20 outline-none"
        placeholder="생생하게 꿈꾸는 미래의 모습을 기록하세요..."
        value={diary?.futureViz ?? ''}
        onChange={(e) => setFutureViz(date, e.target.value)}
      />
    </section>
  );
}
