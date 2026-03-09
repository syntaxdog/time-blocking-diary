'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function BigThree({ date }: { date: string }) {
  const { diaries, setBigThree } = useDiaryStore();
  const diary = diaries[date];
  const bigThree = diary?.bigThree ?? ['', '', ''];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">rocket_launch</span>
        <h2 className="font-bold text-slate-800">오늘의 Big 3</h2>
      </div>
      <div className="space-y-4">
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-black flex-shrink-0">
              {idx + 1}
            </div>
            <input
              className="flex-1 bg-transparent border-b border-slate-100 focus:border-[var(--color-primary)] focus:ring-0 text-sm py-2 outline-none transition-colors"
              placeholder={idx === 0 ? '가장 중요한 업무를 입력하세요' : idx === 1 ? '두 번째 우선순위' : '세 번째 우선순위'}
              value={bigThree[idx]}
              onChange={(e) => setBigThree(date, idx, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
