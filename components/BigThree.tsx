'use client';

import { useDiaryStore } from '@/store/diaryStore';

export default function BigThree({ date }: { date: string }) {
  const { diaries, setBigThree, toggleBigThree } = useDiaryStore();
  const diary = diaries[date];
  const bigThree = diary?.bigThree ?? [
    { text: '', checked: false },
    { text: '', checked: false },
    { text: '', checked: false },
  ];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">rocket_launch</span>
        <h2 className="font-bold text-slate-800">오늘의 Big 3</h2>
      </div>
      <div className="space-y-4">
        {([0, 1, 2] as const).map((idx) => {
          const item = bigThree[idx];
          return (
            <div key={idx} className="flex items-center gap-3 group">
              <button
                onClick={() => toggleBigThree(date, idx)}
                className="flex-shrink-0 text-[var(--color-primary)] hover:scale-110 transition-transform"
                aria-label={item.checked ? '완료 취소' : '완료'}
              >
                <span className="material-symbols-outlined text-2xl">
                  {item.checked ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
              <input
                className={`flex-1 bg-transparent border-b focus:ring-0 text-sm py-2 outline-none transition-colors ${
                  item.checked
                    ? 'line-through text-slate-400 border-slate-100'
                    : 'text-slate-700 border-slate-100 focus:border-[var(--color-primary)]'
                }`}
                placeholder={idx === 0 ? '첫 번째 우선순위' : idx === 1 ? '두 번째 우선순위' : '세 번째 우선순위'}
                value={item.text}
                onChange={(e) => setBigThree(date, idx, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
